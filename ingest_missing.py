"""Ingest missing pipeline JSONs directly into medintel.db.

Replicates the exact logic from backend/routers/papers.py ingest_papers()
but writes directly to SQLite, bypassing HTTP auth.
"""
import json
import sqlite3
from defusedxml.ElementTree import parse as safe_xml_parse
from pathlib import Path

DB_PATH = Path("/root/MedIntel/medintel.db")
RESULTS_DIR = Path("/root/papers/pipeline_outputs/results")
XML_DIRS = [
    Path("/root/papers/nutrition_papers"),
    Path("/root/papers/ophthalmology_papers"),
    Path("/root/papers/nutrition_papers_sample"),
]
MD_DIR = Path("/root/papers/pipeline_outputs/markdown")


def parse_md_title(pmc_id: str) -> str:
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


def parse_xml_metadata(pmc_id: str) -> dict:
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
    except Exception:
        return {}

    meta = {}
    el = root.find(".//article-title")
    if el is not None:
        meta["title"] = "".join(el.itertext()).strip()
    el = root.find(".//journal-title")
    if el is not None:
        meta["journal"] = "".join(el.itertext()).strip()
    for el in root.iter("article-id"):
        if el.get("pub-id-type") == "doi" and el.text:
            meta["doi"] = el.text.strip()
            break
    authors = []
    for cg in root.iter("contrib-group"):
        group_is_authors = cg.get("content-type") == "author"
        for contrib in cg.findall("contrib"):
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
    affs = []
    for aff in root.iter("aff"):
        text = "".join(aff.itertext()).strip().lstrip(", ").strip()
        if text:
            affs.append(text)
    if affs:
        meta["centers"] = affs
        meta["centers_count"] = len(affs)
    return meta


def main():
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    cur.execute("SELECT id FROM papers")
    in_db = set(r[0] for r in cur.fetchall())
    print(f"Already in DB: {len(in_db)}")

    files = sorted(RESULTS_DIR.glob("*.json"))
    print(f"JSON files on disk: {len(files)}")

    ingested = skipped = errors = 0

    for f in files:
        paper_id = f.stem
        if paper_id in in_db:
            skipped += 1
            continue
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            pid = data.get("paper_id", paper_id)
            summary = data.get("summary") or {}
            kf = data.get("key_findings")
            mm = data.get("mind_map")
            vr = data.get("verification")
            xml_meta = parse_xml_metadata(pid)

            title = summary.get("title", "") or xml_meta.get("title", "") or parse_md_title(pid)
            centers_list = xml_meta.get("centers", [])

            cur.execute(
                """INSERT INTO papers
                   (id, title, tldr, detailed_summary, study_type, specialty_tags,
                    pico_summary, key_findings, mind_map, verification,
                    processing_time, has_errors,
                    journal, doi, author_list, authors_count, centers, centers_count)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    pid,
                    title,
                    summary.get("tldr", ""),
                    summary.get("detailed_summary", ""),
                    summary.get("study_type", ""),
                    json.dumps(summary.get("specialty_tags", [])),
                    json.dumps(summary.get("pico_summary")) if summary.get("pico_summary") else "null",
                    json.dumps(kf) if kf else "null",
                    json.dumps(mm) if mm else "null",
                    json.dumps(vr) if vr else "null",
                    data.get("processing_time_seconds", 0.0) or 0.0,
                    bool(data.get("errors")),
                    xml_meta.get("journal", ""),
                    xml_meta.get("doi", ""),
                    xml_meta.get("author_list", ""),
                    xml_meta.get("authors_count", 0),
                    json.dumps(centers_list) if centers_list else "[]",
                    xml_meta.get("centers_count", 0),
                ),
            )
            ingested += 1
        except Exception as e:
            errors += 1
            print(f"  ERROR {paper_id}: {e}")

    conn.commit()
    cur.execute("SELECT COUNT(*) FROM papers")
    total = cur.fetchone()[0]
    conn.close()

    print(f"\nDone: ingested={ingested}, skipped={skipped}, errors={errors}, total_in_db={total}")


if __name__ == "__main__":
    main()
