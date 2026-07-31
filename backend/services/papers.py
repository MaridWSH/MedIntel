"""Paper catalogue business logic — parsing, formatting, and validation.

This module keeps the papers router free of XML parsing, JSON reshaping,
pipeline validation, and response-building helpers. It has no HTTP or
SQLAlchemy query-building concerns beyond simple row transformations.
"""

from __future__ import annotations

import json
import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from defusedxml.ElementTree import parse as safe_xml_parse

from schemas import (
    FacetValue,
    FullTextSection,
    KeyFindingClinical,
    KeyFindingItem,
    KeyFindingsOut,
    MindMapNode,
    MindMapOut,
    PaperDetail,
    PaperListItem,
    VerificationDomains,
    VerificationOut,
)

# ponytail: pipeline output locations — single source of truth
RESULTS_DIR = Path("/root/papers/pipeline_outputs/results")
XML_DIRS = [
    Path("/root/papers/nutrition_papers"),
    Path("/root/papers/ophthalmology_papers"),
    Path("/root/papers/nutrition_papers_sample"),
]
MD_DIR = Path("/root/papers/pipeline_outputs/markdown")
CURRENT_PIPELINE_VERSION = os.getenv(
    "MEDINTEL_PIPELINE_VERSION", "2026-07-14.2"
).strip()
_environment = os.getenv("MEDINTEL_ENV", "development").strip().lower()
REQUIRE_CURRENT_PIPELINE = os.getenv(
    "MEDINTEL_REQUIRE_CURRENT_PIPELINE",
    "true" if _environment in {"production", "staging"} else "false",
).lower() == "true"


def parse_md_title(pmc_id: str) -> str:
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


def to_json(raw: str):
    """Parse a JSON string, returning None on failure."""
    try:
        return json.loads(raw) if raw else None
    except (json.JSONDecodeError, TypeError):
        return None


def parse_xml_metadata(pmc_id: str) -> dict:
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


def parse_stats(text: str) -> dict:
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


def build_mind_map(raw: dict | None, source: str) -> MindMapOut | None:
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


def build_key_findings(raw: dict | None) -> KeyFindingsOut | None:
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


def build_key_finding(kf_out: KeyFindingsOut | None) -> KeyFindingClinical | None:
    """Extract primary clinical finding with parsed stats. ponytail: picks first primary_outcome or first finding."""
    if not kf_out or not kf_out.findings:
        return None
    # Prefer primary_outcome, then clinical_implication, then first
    primary = next((f for f in kf_out.findings if f.finding_type == "primary_outcome"), None)
    if not primary:
        primary = next((f for f in kf_out.findings if f.finding_type == "clinical_implication"), None)
    if not primary:
        primary = kf_out.findings[0]
    stats = parse_stats(primary.statistical_support)
    return KeyFindingClinical(
        headline=primary.claim,
        reduction=stats.get("reduction"),
        hr=stats.get("hr"),
        ci=stats.get("ci"),
        p_value=stats.get("p_value"),
        nnt=stats.get("nnt"),
        n=stats.get("n"),
    )


def build_verification(raw: dict | None) -> VerificationOut | None:
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


def has_summary(paper) -> bool:
    """True when the pipeline actually produced something readable for this paper."""
    has_text = bool((paper.tldr or "").strip() or (paper.detailed_summary or "").strip())
    if not has_text:
        return False
    if not REQUIRE_CURRENT_PIPELINE:
        return True
    verification = to_json(paper.verification) or {}
    return (
        paper.pipeline_version == CURRENT_PIPELINE_VERSION
        and verification.get("passed") is True
        and not paper.has_errors
    )


def pipeline_rejection_reason(data: object, file_stem: str) -> str | None:
    """Return why a pipeline file is not safe to publish, or None when valid."""
    if not isinstance(data, dict):
        return "root value is not an object"
    paper_id = data.get("paper_id")
    if (
        not isinstance(paper_id, str)
        or paper_id != file_stem
        or not re.fullmatch(r"[A-Za-z0-9_.-]{1,50}", paper_id)
    ):
        return "paper_id is invalid or does not match the filename"
    if data.get("pipeline_version") != CURRENT_PIPELINE_VERSION:
        return f"pipeline_version is not {CURRENT_PIPELINE_VERSION}"
    if data.get("errors"):
        return "pipeline reported errors"
    if not isinstance(data.get("summary"), dict) or not data["summary"]:
        return "summary is missing"
    if not isinstance(data.get("key_findings"), dict) or not data["key_findings"]:
        return "key findings are missing"
    verification = data.get("verification")
    if not isinstance(verification, dict) or verification.get("passed") is not True:
        return "verification gate did not pass"
    source_sha256 = data.get("source_sha256")
    if not isinstance(source_sha256, str) or not re.fullmatch(
        r"[0-9a-f]{64}", source_sha256
    ):
        return "source hash is missing or invalid"
    prompt_sha256 = data.get("prompt_sha256")
    required_prompts = {"summary", "key_findings", "mind_map", "verification"}
    if not isinstance(prompt_sha256, dict) or not required_prompts.issubset(prompt_sha256):
        return "prompt provenance is incomplete"
    if any(
        not isinstance(prompt_sha256[name], str)
        or not re.fullmatch(r"[0-9a-f]{64}", prompt_sha256[name])
        for name in required_prompts
    ):
        return "prompt hashes are invalid"
    models = data.get("models")
    if not isinstance(models, dict) or not all(
        isinstance(models.get(name), str) and models[name]
        for name in ("summary", "key_findings", "verification")
    ):
        return "generation-model provenance is incomplete"
    return None


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


def parse_markdown_sections(md: str) -> list[FullTextSection]:
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


def paper_to_list_item(paper) -> PaperListItem:
    """Convert a Paper ORM row to a compact list item."""
    publishable = has_summary(paper)
    findings = (to_json(paper.key_findings) or {}) if publishable else {}
    return PaperListItem(
        id=paper.id,
        title=paper.title or "",
        tldr=paper.tldr if publishable else "",
        study_type=paper.study_type if publishable else "",
        specialty_tags=(
            json.loads(paper.specialty_tags) if publishable and paper.specialty_tags else []
        ),
        journal=paper.journal or "",
        doi=paper.doi or "",
        author_list=paper.author_list or "",
        authors_count=paper.authors_count or 0,
        centers_count=paper.centers_count or 0,
        overall_evidence_level=findings.get("overall_evidence_level"),
        sample_size=findings.get("sample_size"),
        has_summary=publishable,
    )


def paper_to_detail(paper) -> PaperDetail:
    """Convert a Paper ORM row to a full detail response."""
    publishable = has_summary(paper)
    mm_raw = to_json(paper.mind_map) if publishable else None
    kf_raw = to_json(paper.key_findings) if publishable else None
    v_raw = to_json(paper.verification) if publishable else None
    sections = to_json(paper.sections) if paper.sections else []

    kf_out = build_key_findings(kf_raw)

    return PaperDetail(
        id=paper.id,
        title=paper.title or "",
        tldr=paper.tldr if publishable else "",
        detailed_summary=paper.detailed_summary if publishable else "",
        study_type=paper.study_type if publishable else "",
        specialty_tags=(
            json.loads(paper.specialty_tags) if publishable and paper.specialty_tags else []
        ),
        journal=paper.journal or "",
        doi=paper.doi or "",
        author_list=paper.author_list or "",
        authors_count=paper.authors_count or 0,
        centers=to_json(paper.centers) or [],
        centers_count=paper.centers_count or 0,
        pico_summary=to_json(paper.pico_summary) if publishable else None,
        # ponytail: typed structured fields
        has_errors=paper.has_errors if publishable else False,
        mind_map=build_mind_map(mm_raw, paper.title or paper.id),
        key_finding=build_key_finding(kf_out),
        key_findings=kf_out,
        verification=build_verification(v_raw),
        citation=paper.citation or "",
        sections=sections or [],
        excerpt=paper.excerpt or "",
        reviewer=paper.reviewer or "",
        processing_time=paper.processing_time if publishable else 0.0,
    )
