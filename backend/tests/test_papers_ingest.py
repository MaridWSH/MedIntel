import json
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from auth import hash_password
from database import Base
from models import Paper, User
from routers import papers as papers_router
from routers.papers import ingest_papers
from schemas import IngestRequest


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def authenticated_user(db_session):
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_ingest_papers_from_pipeline_json(tmp_path: Path, db_session, authenticated_user, monkeypatch):
    source_dir = tmp_path / "pipeline_outputs" / "results"
    source_dir.mkdir(parents=True)

    paper_data = {
        "paper_id": "PMC_TEST",
        "pipeline_version": "2026-07-14.2",
        "source_sha256": "a" * 64,
        "models": {
            "summary": "model-a",
            "key_findings": "model-a",
            "mind_map": "model-b",
            "verification": "model-b",
        },
        "prompt_sha256": {
            "summary": "b" * 64,
            "key_findings": "c" * 64,
            "mind_map": "d" * 64,
            "verification": "e" * 64,
        },
        "summary": {
            "title": "Test paper title",
            "tldr": "This is a short summary.",
            "detailed_summary": "Detailed synthesis of the paper.",
            "study_type": "RCT",
            "specialty_tags": ["endocrinology"],
            "pico_summary": {"population": "adults"},
        },
        "key_findings": {"overall_evidence_level": "high"},
        "mind_map": {"nodes": []},
        "verification": {"passed": True},
        "processing_time_seconds": 2.3,
        "errors": False,
    }

    file_path = source_dir / "PMC_TEST.json"
    file_path.write_text(json.dumps(paper_data), encoding="utf-8")

    def fake_realpath(path: str) -> str:
        normalized = str(path)
        if normalized == "/root/papers/pipeline_outputs/results":
            return str(source_dir)
        if normalized == str(source_dir):
            return str(source_dir)
        return str(Path(normalized).resolve())

    monkeypatch.setattr("os.path.realpath", fake_realpath)

    response = ingest_papers(
        body=IngestRequest(source_dir=str(source_dir), limit=None),
        db=db_session,
        current_user=authenticated_user,
    )

    assert response.ingested == 1
    assert response.skipped == 0
    assert response.errors == 0
    assert response.total_in_db == 1

    paper = db_session.query(Paper).filter(Paper.id == "PMC_TEST").first()
    assert paper is not None
    assert paper.title == "Test paper title"
    assert paper.tldr == "This is a short summary."
    assert paper.study_type == "RCT"
    assert paper.specialty_tags == json.dumps(["endocrinology"])
    assert paper.pipeline_version == "2026-07-14.2"
    assert paper.source_sha256 == "a" * 64

    # A regenerated result updates the existing paper instead of leaving stale
    # AI output in the database.
    paper_data["summary"]["tldr"] = "This summary was regenerated."
    file_path.write_text(json.dumps(paper_data), encoding="utf-8")
    update_response = ingest_papers(
        body=IngestRequest(source_dir=str(source_dir), limit=None),
        db=db_session,
        current_user=authenticated_user,
    )

    assert update_response.ingested == 1
    assert update_response.total_in_db == 1
    db_session.refresh(paper)
    assert paper.tldr == "This summary was regenerated."


def test_ingest_rejects_unverified_pipeline_result(
    tmp_path: Path, db_session, authenticated_user, monkeypatch
):
    source_dir = tmp_path / "pipeline_outputs" / "results"
    source_dir.mkdir(parents=True)
    (source_dir / "PMC_REJECT.json").write_text(
        json.dumps(
            {
                "paper_id": "PMC_REJECT",
                "pipeline_version": "2026-07-14.2",
                "source_sha256": "a" * 64,
                "models": {
                    "summary": "model-a",
                    "key_findings": "model-a",
                    "verification": "model-b",
                },
                "prompt_sha256": {
                    "summary": "b" * 64,
                    "key_findings": "c" * 64,
                    "mind_map": "d" * 64,
                    "verification": "e" * 64,
                },
                "summary": {"title": "Unsafe result"},
                "key_findings": {"findings": []},
                "verification": {"passed": False},
                "errors": ["verification gate failed"],
            }
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "os.path.realpath",
        lambda path: str(source_dir)
        if str(path) in {"/root/papers/pipeline_outputs/results", str(source_dir)}
        else str(Path(path).resolve()),
    )

    response = ingest_papers(
        body=IngestRequest(source_dir=str(source_dir), limit=None),
        db=db_session,
        current_user=authenticated_user,
    )

    assert response.ingested == 0
    assert response.skipped == 1
    assert response.errors == 0
    assert db_session.query(Paper).count() == 0


def test_production_publication_gate_hides_stale_ai_output(monkeypatch):
    monkeypatch.setattr(papers_router, "REQUIRE_CURRENT_PIPELINE", True)
    paper = Paper(
        id="PMC_STALE",
        title="Source title",
        tldr="An old AI summary",
        detailed_summary="Old details",
        study_type="RCT",
        specialty_tags="[]",
        key_findings="null",
        verification=json.dumps({"passed": True}),
        pipeline_version="older-version",
        has_errors=False,
    )

    stale_item = papers_router._paper_to_list_item(paper)
    assert stale_item.has_summary is False
    assert stale_item.tldr == ""

    paper.pipeline_version = papers_router.CURRENT_PIPELINE_VERSION
    current_item = papers_router._paper_to_list_item(paper)
    assert current_item.has_summary is True
    assert current_item.tldr == "An old AI summary"
