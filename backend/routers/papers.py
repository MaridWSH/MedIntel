"""Papers router — list, detail, search, ingest, backfill."""

import json
import logging
import math
import re
import xml.etree.ElementTree as ET
from defusedxml.ElementTree import parse as safe_xml_parse
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Paper, User
from schemas import (
    BackfillRequest,
    BackfillResponse,
    FullTextResponse,
    FullTextSection,
    IngestRequest,
    IngestResponse,
    KeyFindingClinical,
    KeyFindingItem,
    KeyFindingsOut,
    MindMapNode,
    MindMapOut,
    PaperDetail,
    PaperListItem,
    PaperListResponse,
    SearchResponse,
    VerificationDomains,
    VerificationOut,
)

router = APIRouter(prefix="/papers", tags=["papers"])

# ponytail: pipeline output locations — single source of truth
RESULTS_DIR = Path("/root/papers/pipeline_outputs/results")
XML_DIRS = [
    Path("/root/papers/nutrition_papers"),
    Path("/root/papers/ophthalmology_papers"),
    Path("/root/papers/nutrition_papers_sample"),
]
MD_DIR = Path("/root/papers/pipeline_outputs/markdown")


def _parse_md_title(pmc_id: str) -> str:
    """Extract title from the first H1 line in the markdown file. ponytail: best-effort."""
    md_path = MD_DIR / f"{pmc_id}.md"
    if not md_path.exists():
        return ""
    try:
        for line in md_path.read_text(encoding="utf-8").splitlines()[:5]:
            if line.startswith("# "):
                return line[2:].strip()
    except OSError:
        pass
    return ""


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_json(raw: str):
    """Parse a JSON string, returning None on failure."""
    try:
        return json.loads(raw) if raw else None
    except (json.JSONDecodeError, TypeError):
        return None


def _parse_xml_metadata(pmc_id: str) -> dict:
    """Extract journal, title, doi, authors, centers from JATS XML. ponytail: best-effort — returns {} on any failure."""
    xml_path = None
    for d in XML_DIRS:
        candidate = d / f"{pmc_id}.xml"
        if candidate.exists():
            xml_path = candidate
            break
    if xml_path is None:
        return {}
    try:
        root = safe_xml_parse(xml_path).getroot()
    except ET.ParseError:
        return {}

    meta = {}

    # Title — <article-title>
    el = root.find(".//article-title")
    if el is not None:
        meta["title"] = "".join(el.itertext()).strip()

    # Journal — <journal-title>
    el = root.find(".//journal-title")
    if el is not None:
        meta["journal"] = "".join(el.itertext()).strip()

    # DOI — <article-id pub-id-type="doi">
    for el in root.iter("article-id"):
        if el.get("pub-id-type") == "doi" and el.text:
            meta["doi"] = el.text.strip()
            break

    # Authors — <contrib contrib-type="author"> OR <contrib-group content-type="author"><contrib>
    authors = []
    for contrib_group in root.iter("contrib-group"):
        # Check if this group is for authors (attribute can be on group or individual contribs)
        group_is_authors = contrib_group.get("content-type") == "author"
        for contrib in contrib_group.findall("contrib"):
            is_author = group_is_authors or contrib.get("contrib-type") == "author"
            if not is_author:
                continue
            name = contrib.find("name")
            if name is None:
                continue
            surname = (name.findtext("surname") or "").strip()
            given = (name.findtext("given-names") or "").strip()
            full = f"{given} {surname}".strip() if given or surname else ""
            if full:
                authors.append(full)
    if authors:
        meta["author_list"] = ", ".join(authors)
        meta["authors_count"] = len(authors)

    # Centers — <aff> elements
    affs = []
    for aff in root.iter("aff"):
        text = "".join(aff.itertext()).strip()
        # ponytail: JATS aff has mixed content — strip leading punctuation artifacts
        text = text.lstrip(", ").strip()
        if text:
            affs.append(text)
    if affs:
        meta["centers"] = affs
        meta["centers_count"] = len(affs)

    # Sections — top-level <sec><title> in <body>
    sections = []
    body = root.find(".//body")
    if body is not None:
        for sec in body.findall("sec"):
            t = sec.findtext("title")
            if t and t.strip():
                sections.append(t.strip())
    if sections:
        meta["sections"] = sections

    # Excerpt — <abstract> text
    abstract_el = root.find(".//abstract")
    if abstract_el is not None:
        excerpt = " ".join(p.strip() for p in abstract_el.itertext() if p.strip())
        if excerpt:
            meta["excerpt"] = excerpt

    # Reviewer/Editor — contrib-type="editor" or "reviewer"
    reviewers = []
    for contrib in root.iter("contrib"):
        ct = contrib.get("contrib-type", "")
        if ct in ("editor", "reviewer"):
            name = contrib.find("name")
            if name is not None:
                surname = (name.findtext("surname") or "").strip()
                given = (name.findtext("given-names") or "").strip()
                full = f"{given} {surname}".strip() if given or surname else ""
                if full:
                    reviewers.append(full)
    if reviewers:
        meta["reviewer"] = ", ".join(reviewers)

    # Citation — build from authors + title + journal + year + doi
    # ponytail: best-effort formatted citation
    year = ""
    for el in root.iter("pub-date"):
        y = el.findtext("year")
        if y and y.strip().isdigit():
            year = y.strip()
            break
    if not year:
        # try <article-meta><pub-history><event><date>
        for el in root.iter("date"):
            y = el.findtext("year")
            if y and y.strip().isdigit():
                year = y.strip()
                break

    citation_parts = []
    if authors:
        # ponytail: first 3 authors + et al. for readability
        if len(authors) > 3:
            citation_parts.append(", ".join(authors[:3]) + " et al.")
        else:
            citation_parts.append(", ".join(authors))
    if meta.get("title"):
        citation_parts.append(meta["title"])
    if meta.get("journal"):
        citation_parts.append(meta["journal"])
    if year:
        citation_parts.append(f"({year})")
    if meta.get("doi"):
        citation_parts.append(f"https://doi.org/{meta['doi']}")
    if citation_parts:
        meta["citation"] = ". ".join(citation_parts) if len(citation_parts) <= 2 else ". ".join(citation_parts[:2]) + ". " + ". ".join(citation_parts[2:])

    return meta


# ── Reshaping helpers ─────────────────────────────────────────────────────────

def _parse_stats(text: str) -> dict:
    """Extract clinical stats (HR, CI, p-value, NNT, N) from a text string. ponytail: regex best-effort."""
    if not text:
        return {}
    stats = {}
    # HR: "HR 0.75", "HR=0.75", "hazard ratio 0.75"
    m = re.search(r"(?:HR|hazard\s*ratio)\s*[=:]\s*([\d.]+)", text, re.IGNORECASE)
    if m:
        stats["hr"] = float(m.group(1))
    # CI: "95% CI 0.5-0.9", "CI: 0.5-0.9", "95% CI: 0.5 to 0.9"
    m = re.search(r"(\d+%?\s*)?CI\s*[=:]\s*([\d.]+)\s*[-–to]+\s*([\d.]+)", text, re.IGNORECASE)
    if m:
        stats["ci"] = f"{m.group(2)}-{m.group(3)}"
    # p-value: "p=0.03", "p < 0.05", "p=0.001"
    m = re.search(r"p\s*[=<>]+\s*([\d.e+-]+)", text, re.IGNORECASE)
    if m:
        try:
            stats["p_value"] = float(m.group(1))
        except ValueError:
            pass
    # NNT: "NNT = 5", "NNT: 5"
    m = re.search(r"NNT\s*[=:]\s*([\d.]+)", text, re.IGNORECASE)
    if m:
        stats["nnt"] = float(m.group(1))
    # N (sample size): "n = 100", "N=100", "(n=100)"
    m = re.search(r"(?:^|[\s(=])n\s*[=:]\s*(\d+)", text, re.IGNORECASE)
    if m:
        stats["n"] = int(m.group(1))
    # Reduction: "reduced by 25%", "30% reduction", "risk reduction 40%"
    m = re.search(r"([\d.]+)%\s*(?:reduction|risk\s*reduction|lower|decrease)", text, re.IGNORECASE)
    if m:
        stats["reduction"] = f"{m.group(1)}%"
    return stats


def _build_mind_map(raw: dict | None, source: str) -> MindMapOut | None:
    """Reshape mind_map JSON → MindMapOut(nodes, source)."""
    if not raw:
        return None
    children = raw.get("children", [])

    def _to_node(c: dict) -> MindMapNode:
        return MindMapNode(
            id=c.get("id", ""),
            label=c.get("label", ""),
            node_type=c.get("node_type", ""),
            children=[_to_node(gc) for gc in c.get("children", [])],
        )

    return MindMapOut(nodes=[_to_node(c) for c in children], source=source)


def _build_key_findings(raw: dict | None) -> KeyFindingsOut | None:
    """Reshape key_findings → {signal, practice_points, findings, ...}."""
    if not raw or not isinstance(raw, dict):
        return None
    findings_raw = raw.get("findings", [])
    findings = [
        KeyFindingItem(
            claim=f.get("claim", ""),
            evidence_strength=f.get("evidence_strength", ""),
            finding_type=f.get("finding_type", ""),
            statistical_support=f.get("statistical_support", ""),
            source_quote=f.get("source_quote", ""),
            limitations_noted=f.get("limitations_noted", False),
        )
        for f in findings_raw
    ]
    evidence = raw.get("overall_evidence_level", "")
    # signal: one-liner combining evidence level + first finding
    first_claim = findings_raw[0].get("claim", "") if findings_raw else ""
    signal = f"{evidence}: {first_claim}" if evidence and first_claim else (evidence or first_claim)
    # practice_points: actionable claims (primary outcomes) or all claims shortened
    practice_points = []
    for f in findings_raw:
        if f.get("finding_type") in ("primary_outcome", "clinical_implication"):
            practice_points.append(f.get("claim", ""))
    if not practice_points:
        practice_points = [f.get("claim", "") for f in findings_raw[:5]]
    return KeyFindingsOut(
        signal=signal,
        practice_points=practice_points,
        findings=findings,
        overall_evidence_level=evidence or None,
        sample_size=raw.get("sample_size"),
    )


def _build_key_finding(kf_out: KeyFindingsOut | None) -> KeyFindingClinical | None:
    """Extract primary clinical finding with parsed stats. ponytail: picks first primary_outcome or first finding."""
    if not kf_out or not kf_out.findings:
        return None
    # Prefer primary_outcome, then clinical_implication, then first
    primary = next((f for f in kf_out.findings if f.finding_type == "primary_outcome"), None)
    if not primary:
        primary = next((f for f in kf_out.findings if f.finding_type == "clinical_implication"), None)
    if not primary:
        primary = kf_out.findings[0]
    stats = _parse_stats(primary.statistical_support)
    return KeyFindingClinical(
        headline=primary.claim,
        reduction=stats.get("reduction"),
        hr=stats.get("hr"),
        ci=stats.get("ci"),
        p_value=stats.get("p_value"),
        nnt=stats.get("nnt"),
        n=stats.get("n"),
    )


def _build_verification(raw: dict | None) -> VerificationOut | None:
    """Reshape verification JSON → {score, grade, domains, bias_flags, limitations, passed}."""
    if not raw or not isinstance(raw, dict):
        return None
    num_score = raw.get("numerical_accuracy_score", 0.0) or 0.0
    fac_score = raw.get("factual_accuracy_score", 0.0) or 0.0
    overall = raw.get("overall_accuracy_score", 0.0) or 0.0
    critical = raw.get("critical_errors", []) or []
    recs = raw.get("recommendations", []) or []
    passed = raw.get("passed", False)

    # ponytail: grade from overall score — A/B/C/D/F
    if overall >= 0.9:
        grade = "A"
    elif overall >= 0.75:
        grade = "B"
    elif overall >= 0.6:
        grade = "C"
    elif overall >= 0.4:
        grade = "D"
    else:
        grade = "F"

    # bias_flags: summarize critical errors as short strings
    bias_flags = []
    for err in critical:
        if isinstance(err, dict):
            bias_flags.append(err.get("claim_text", "") or err.get("description", "") or str(err))
        else:
            bias_flags.append(str(err))

    return VerificationOut(
        score=overall,
        grade=grade,
        domains=VerificationDomains(numerical=num_score, factual=fac_score, overall=overall),
        bias_flags=bias_flags,
        limitations=recs,
        passed=passed,
    )


def _has_summary(paper: Paper) -> bool:
    """True when the pipeline actually produced something readable for this paper."""
    return bool((paper.tldr or "").strip() or (paper.detailed_summary or "").strip())


def _paper_to_list_item(paper: Paper) -> PaperListItem:
    """Convert a Paper ORM row to a compact list item."""
    findings = _to_json(paper.key_findings) or {}
    return PaperListItem(
        id=paper.id,
        title=paper.title or "",
        tldr=paper.tldr,
        study_type=paper.study_type,
        specialty_tags=json.loads(paper.specialty_tags) if paper.specialty_tags else [],
        journal=paper.journal or "",
        doi=paper.doi or "",
        author_list=paper.author_list or "",
        authors_count=paper.authors_count or 0,
        centers_count=paper.centers_count or 0,
        overall_evidence_level=findings.get("overall_evidence_level"),
        sample_size=findings.get("sample_size"),
        has_summary=_has_summary(paper),
    )


# ── Full text ─────────────────────────────────────────────────────────────────

_HEADING_RE = re.compile(r"^(#{2,3})\s+(.+?)\s*$")


def _slugify(text: str, seen: set[str]) -> str:
    """Stable anchor id for a section heading, de-duplicated within one paper."""
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "section"
    candidate = slug
    n = 2
    while candidate in seen:
        candidate = f"{slug}-{n}"
        n += 1
    seen.add(candidate)
    return candidate


def _parse_markdown_sections(md: str) -> list[FullTextSection]:
    """Split the pipeline's markdown into ## / ### sections.

    Content before the first heading (i.e. the H1 title) is dropped — the title
    is already on the page.
    """
    sections: list[FullTextSection] = []
    seen: set[str] = set()
    current: FullTextSection | None = None
    body: list[str] = []

    for line in md.splitlines():
        match = _HEADING_RE.match(line)
        if match:
            if current is not None:
                current.content = "\n".join(body).strip()
                sections.append(current)
            hashes, title = match.groups()
            current = FullTextSection(
                id=_slugify(title, seen),
                title=title,
                level=len(hashes),
                content="",
            )
            body = []
        elif current is not None:
            body.append(line)

    if current is not None:
        current.content = "\n".join(body).strip()
        sections.append(current)

    return sections


@router.get("/{paper_id}/fulltext", response_model=FullTextResponse)
def get_paper_fulltext(paper_id: str, db: Session = Depends(get_db)):
    """Full text of the source paper, split into anchored sections.

    The pipeline failed to summarise ~52% of the catalogue, but it still wrote
    markdown for most of those papers. Serving it means a paper with no AI
    summary is still worth opening, and gives the section nav something real to
    scroll to.
    """
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # ponytail: paper_id comes from the URL — keep it inside MD_DIR.
    md_path = (MD_DIR / f"{paper_id}.md").resolve()
    if not str(md_path).startswith(str(MD_DIR.resolve()) + "/") or not md_path.exists():
        return FullTextResponse(
            paper_id=paper_id,
            title=paper.title or "",
            sections=[],
            available=False,
        )

    try:
        md = md_path.read_text(encoding="utf-8")
    except OSError:
        logger.exception("Could not read markdown for %s", paper_id)
        return FullTextResponse(
            paper_id=paper_id, title=paper.title or "", sections=[], available=False
        )

    sections = _parse_markdown_sections(md)
    return FullTextResponse(
        paper_id=paper_id,
        title=paper.title or "",
        sections=sections,
        available=bool(sections),
    )


def _paper_to_detail(paper: Paper) -> PaperDetail:
    """Convert a Paper ORM row to a full detail response."""
    mm_raw = _to_json(paper.mind_map)
    kf_raw = _to_json(paper.key_findings)
    v_raw = _to_json(paper.verification)
    sections = _to_json(paper.sections) if paper.sections else []

    kf_out = _build_key_findings(kf_raw)

    return PaperDetail(
        id=paper.id,
        title=paper.title or "",
        tldr=paper.tldr,
        detailed_summary=paper.detailed_summary,
        study_type=paper.study_type,
        specialty_tags=json.loads(paper.specialty_tags) if paper.specialty_tags else [],
        journal=paper.journal or "",
        doi=paper.doi or "",
        author_list=paper.author_list or "",
        authors_count=paper.authors_count or 0,
        centers=_to_json(paper.centers) or [],
        centers_count=paper.centers_count or 0,
        pico_summary=_to_json(paper.pico_summary),
        # ponytail: typed structured fields
        has_errors=paper.has_errors,
        mind_map=_build_mind_map(mm_raw, paper.title or paper.id),
        key_finding=_build_key_finding(kf_out),
        key_findings=kf_out,
        verification=_build_verification(v_raw),
        citation=paper.citation or "",
        sections=sections or [],
        excerpt=paper.excerpt or "",
        reviewer=paper.reviewer or "",
        processing_time=paper.processing_time,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=PaperListResponse)
def list_papers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    study_type: str | None = None,
    specialty: str | None = None,
    sort: str = Query("id", pattern="^(id|-id)$"),
    summarised_only: bool = Query(
        True,
        description="Exclude papers the pipeline never summarised (52% of rows).",
    ),
    db: Session = Depends(get_db),
):
    """Paginated paper listing with optional filters.

    Defaults to summarised papers only. Of the 7,184 rows, 3,765 have no tldr and
    no summary — listing them advertised a catalogue twice its real size and sent
    readers to pages with nothing on them.
    """
    query = db.query(Paper)

    if summarised_only:
        query = query.filter(Paper.tldr != "", Paper.tldr.isnot(None))

    if study_type:
        query = query.filter(Paper.study_type == study_type)

    if specialty:
        # SQLite: filter where specialty_tags JSON contains the tag
        query = query.filter(Paper.specialty_tags.contains(specialty))

    total = query.count()
    pages = max(1, math.ceil(total / per_page))

    order = Paper.id.desc() if sort == "-id" else Paper.id
    items = query.order_by(order).offset((page - 1) * per_page).limit(per_page).all()

    return PaperListResponse(
        items=[_paper_to_list_item(p) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


# ponytail: cap on how deep semantic results go. Vector search is ranked, not
# exhaustive — beyond a few hundred hits relevance is noise, so we retrieve a
# fixed window and paginate within it rather than pretending to have a real total.
SEMANTIC_MAX_RESULTS = 200

logger = logging.getLogger(__name__)


def _keyword_search(db: Session, q: str) -> list[Paper]:
    """Substring match over title, tldr and detailed_summary.

    Title used to be excluded, so searching for a paper by its own name returned
    nothing unless the words also happened to appear in the summary.
    """
    pattern = f"%{q}%"
    return (
        db.query(Paper)
        .filter(
            or_(
                Paper.title.ilike(pattern),
                Paper.tldr.ilike(pattern),
                Paper.detailed_summary.ilike(pattern),
            )
        )
        .all()
    )


def _semantic_search(db: Session, q: str) -> list[Paper] | None:
    """Vector search via Qdrant, ranked by similarity.

    Returns None (not []) when the semantic stack is unavailable, so the caller
    can tell "search is broken" apart from "search found nothing" and fall back
    to keyword matching instead of showing an empty page.
    """
    try:
        from services.semantic_search_service import get_semantic_search_service

        service = get_semantic_search_service(db)
        results = service.search(query=q, top_k=SEMANTIC_MAX_RESULTS)
        return [r.paper for r in results]
    except Exception:
        logger.exception("Semantic search failed for %r — falling back to keyword", q)
        return None


@router.get("/search", response_model=SearchResponse)
def search_papers(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    mode: str = Query("auto", pattern="^(auto|semantic|keyword)$"),
    db: Session = Depends(get_db),
):
    """Search papers.

    `auto` (default) runs semantic search and falls back to keyword matching if
    the vector store is unavailable or returns nothing — so a natural-language
    question or a typo still finds papers, which plain substring matching cannot do.
    """
    matches: list[Paper] | None = None

    if mode in ("auto", "semantic"):
        matches = _semantic_search(db, q)

    if mode == "keyword" or (mode == "auto" and not matches):
        matches = _keyword_search(db, q)

    matches = matches or []

    total = len(matches)
    pages = max(1, math.ceil(total / per_page)) if total else 1
    start = (page - 1) * per_page
    items = matches[start : start + per_page]

    return SearchResponse(
        items=[_paper_to_list_item(p) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        query=q,
    )


@router.get("/{paper_id}", response_model=PaperDetail)
def get_paper(paper_id: str, db: Session = Depends(get_db)):
    """Get full paper detail by PMC ID."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return _paper_to_detail(paper)


@router.post("/ingest", response_model=IngestResponse)
def ingest_papers(
    body: IngestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ingest pipeline JSON results into the database. Requires auth.

    For fields missing from the pipeline JSON (title, journal, doi, authors, centers),
    falls back to parsing the corresponding JATS XML file from the source directory.
    """
    import os

    # Restrict to allowed base directory to prevent path traversal
    ALLOWED_BASE = os.path.realpath(str(RESULTS_DIR))

    if body.source_dir:
        candidate = os.path.realpath(body.source_dir)
        if not candidate.startswith(ALLOWED_BASE + os.sep) and candidate != ALLOWED_BASE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: source_dir must be within {ALLOWED_BASE}",
            )
        source_dir = Path(candidate)
    else:
        source_dir = RESULTS_DIR

    if not source_dir.exists():
        raise HTTPException(status_code=400, detail=f"Source directory not found: {source_dir}")

    files = sorted(source_dir.glob("*.json"))
    if body.limit:
        files = files[:body.limit]

    ingested = 0
    skipped = 0
    errors = 0

    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            paper_id = data.get("paper_id", f.stem)

            existing = db.query(Paper).filter(Paper.id == paper_id).first()
            if existing:
                skipped += 1
                continue

            summary = data.get("summary") or {}
            key_findings_raw = data.get("key_findings")
            mind_map_raw = data.get("mind_map")
            verification_raw = data.get("verification")

            # ponytail: XML fallback — fill gaps in title/journal/authors/centers
            xml_meta = _parse_xml_metadata(paper_id)

            title = summary.get("title", "") or xml_meta.get("title", "") or _parse_md_title(paper_id)
            centers_list = xml_meta.get("centers", [])

            paper = Paper(
                id=paper_id,
                title=title,
                tldr=summary.get("tldr", ""),
                detailed_summary=summary.get("detailed_summary", ""),
                study_type=summary.get("study_type", ""),
                specialty_tags=json.dumps(summary.get("specialty_tags", [])),
                pico_summary=json.dumps(summary.get("pico_summary")) if summary.get("pico_summary") else "null",
                key_findings=json.dumps(key_findings_raw) if key_findings_raw else "null",
                mind_map=json.dumps(mind_map_raw) if mind_map_raw else "null",
                verification=json.dumps(verification_raw) if verification_raw else "null",
                processing_time=data.get("processing_time_seconds", 0.0) or 0.0,
                has_errors=bool(data.get("errors")),
                journal=xml_meta.get("journal", ""),
                doi=xml_meta.get("doi", ""),
                author_list=xml_meta.get("author_list", ""),
                authors_count=xml_meta.get("authors_count", 0),
                centers=json.dumps(centers_list) if centers_list else "[]",
                centers_count=xml_meta.get("centers_count", 0),
                citation=xml_meta.get("citation", ""),
                sections=json.dumps(xml_meta.get("sections", [])),
                excerpt=xml_meta.get("excerpt", ""),
                reviewer=xml_meta.get("reviewer", ""),
            )
            db.add(paper)
            ingested += 1

        except Exception:
            errors += 1

    db.commit()
    total_in_db = db.query(Paper).count()

    return IngestResponse(
        ingested=ingested,
        skipped=skipped,
        errors=errors,
        total_in_db=total_in_db,
    )


@router.post("/backfill", response_model=BackfillResponse)
def backfill_metadata(
    body: BackfillRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Backfill missing metadata (journal, doi, authors, centers, title) from XML.

    For papers already in the DB that are missing these fields, look up the
    corresponding JATS XML and fill in the gaps. Requires auth.
    """
    query = db.query(Paper).filter(
        or_(
            Paper.title == "",
            Paper.journal == "",
            Paper.doi == "",
            Paper.authors_count == 0,
            Paper.centers_count == 0,
            Paper.citation == "",
            Paper.sections == "[]",
            Paper.excerpt == "",
        )
    )
    if body.limit:
        papers = query.limit(body.limit).all()
    else:
        papers = query.all()

    updated = 0
    skipped_no_xml = 0
    skipped_already_filled = 0
    errors = 0

    for paper in papers:
        xml_meta = _parse_xml_metadata(paper.id)
        md_title = _parse_md_title(paper.id) if not xml_meta else ""
        if not xml_meta and not md_title:
            skipped_no_xml += 1
            continue

        if not xml_meta and md_title:
            # ponytail: only have markdown title — use it, no other metadata available
            xml_meta = {"title": md_title}

        changed = False

        if not paper.title and xml_meta.get("title"):
            paper.title = xml_meta["title"]
            changed = True
        if not paper.journal and xml_meta.get("journal"):
            paper.journal = xml_meta["journal"]
            changed = True
        if not paper.doi and xml_meta.get("doi"):
            paper.doi = xml_meta["doi"]
            changed = True
        if not paper.author_list and xml_meta.get("author_list"):
            paper.author_list = xml_meta["author_list"]
            paper.authors_count = xml_meta.get("authors_count", 0)
            changed = True
        if not paper.centers_count and xml_meta.get("centers"):
            paper.centers = json.dumps(xml_meta["centers"])
            paper.centers_count = xml_meta["centers_count"]
            changed = True
        if not paper.citation and xml_meta.get("citation"):
            paper.citation = xml_meta["citation"]
            changed = True
        if (not paper.sections or paper.sections == "[]") and xml_meta.get("sections"):
            paper.sections = json.dumps(xml_meta["sections"])
            changed = True
        if not paper.excerpt and xml_meta.get("excerpt"):
            paper.excerpt = xml_meta["excerpt"]
            changed = True
        if not paper.reviewer and xml_meta.get("reviewer"):
            paper.reviewer = xml_meta["reviewer"]
            changed = True

        if changed:
            updated += 1
        else:
            skipped_already_filled += 1

    db.commit()

    return BackfillResponse(
        updated=updated,
        skipped_no_xml=skipped_no_xml,
        skipped_already_filled=skipped_already_filled,
        errors=errors,
    )
