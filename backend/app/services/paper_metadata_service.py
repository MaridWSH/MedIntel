"""Paper metadata extraction from XML and markdown source files.

Shared helpers used by both the public papers router and the admin router.
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path

from defusedxml.ElementTree import parse as safe_xml_parse

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
    year = ""
    for el in root.iter("pub-date"):
        y = el.findtext("year")
        if y and y.strip().isdigit():
            year = y.strip()
            break
    if not year:
        for el in root.iter("date"):
            y = el.findtext("year")
            if y and y.strip().isdigit():
                year = y.strip()
                break

    citation_parts = []
    if authors:
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
