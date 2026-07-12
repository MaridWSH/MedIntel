import json
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from auth import hash_password
from database import Base
from models import Paper, User
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
        "verification": {"verified": True},
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
        body=IngestRequest(source_dir=str(source_dir), limit=0),
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
