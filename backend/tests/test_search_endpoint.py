"""Tests for the hybrid search endpoint."""

from __future__ import annotations

import json
from dataclasses import dataclass, field

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from api.dependencies import get_hybrid_search_service
from database import Base, get_db
from main import app
from models import Paper
from services.hybrid_search_service import HybridSearchService


@dataclass
class FakePaper:
    """Minimal stand-in for the Paper ORM row used in tests."""

    id: str
    title: str = ""
    tldr: str = ""
    detailed_summary: str = ""
    abstract: str = ""
    keywords: str = ""
    study_type: str = ""
    specialty_tags: str = "[]"
    publication_year: int | None = None
    journal: str = ""
    language: str = "en"
    author_list: str = ""
    authors_count: int | None = None
    centers_count: int | None = None
    doi: str = ""
    evidence_level: str = ""
    processing_time: float = 0.0
    has_errors: bool = False
    search_vector: Any = None


@dataclass
class FakePaperRepository:
    """Paper repository that returns a configurable list of papers and supports keyword search."""

    papers: list[FakePaper]

    def get_by_ids(self, paper_ids: list[str]) -> list[FakePaper]:
        paper_by_id = {p.id: p for p in self.papers}
        return [paper_by_id[pid] for pid in paper_ids if pid in paper_by_id]

    def get_all(self, batch_size=None, limit=None):
        for p in self.papers[:limit]:
            yield p

    def keyword_search(self, query: str, top_k: int = 100) -> list[tuple[FakePaper, float]]:
        """Simple substring keyword search for testing."""
        query_lower = query.lower()
        matches: list[tuple[FakePaper, float]] = []
        for paper in self.papers:
            corpus = " ".join(
                [
                    paper.title,
                    paper.tldr,
                    paper.detailed_summary,
                    paper.abstract,
                    paper.keywords,
                ]
            ).lower()
            if query_lower in corpus:
                matches.append((paper, 0.5))
        return matches[:top_k]


@dataclass
class FakeVectorRepository:
    """Vector repository that returns a configurable list of semantic hits."""

    hits: list[tuple[str, float]] = field(default_factory=list)

    def search(self, query_vector, top_k=5, score_threshold=None, filters=None):
        class _Result:
            def __init__(self, paper_id, score):
                self.paper_id = paper_id
                self.score = score

        return [_Result(pid, score) for pid, score in self.hits[:top_k]]


class FakeEmbeddingService:
    """Dummy embedding service that returns a fixed vector."""

    def __init__(self, dimension: int = 1024):
        self.dimension = dimension

    def encode_query(self, query: str):
        return [0.0] * self.dimension

    def encode_passage_for_paper(self, paper):
        return [0.0] * self.dimension


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def sample_papers():
    return [
        FakePaper(
            id="PMC_NUTRITION_1",
            title="Nutrition therapy in obesity management",
            tldr="Dietary intervention reduces BMI in adults with obesity.",
            detailed_summary="A 12-week RCT of nutrition counselling.",
            abstract="Caloric restriction and macronutrient counselling.",
            keywords="nutrition obesity diet",
            study_type="RCT",
            specialty_tags=json.dumps(["Nutrition", "Endocrinology"]),
            publication_year=2023,
            journal="Journal of Nutrition",
            language="en",
            author_list="Smith J, Doe A",
            evidence_level="high",
        ),
        FakePaper(
            id="PMC_CARDIO_1",
            title="Cardiovascular outcomes in obesity",
            tldr="Obesity increases risk of cardiovascular events.",
            detailed_summary="Cohort study of 10,000 patients.",
            abstract="Longitudinal observational study.",
            keywords="cardiology obesity",
            study_type="cohort_study",
            specialty_tags=json.dumps(["Cardiology"]),
            publication_year=2021,
            journal="Cardiology Today",
            language="en",
            author_list="Lee B",
            evidence_level="moderate",
        ),
        FakePaper(
            id="PMC_NUTRITION_2",
            title="Pediatric nutrition and obesity",
            tldr="School nutrition programs reduce childhood obesity.",
            detailed_summary="Cluster RCT in 50 schools.",
            abstract="Nutrition education in schools.",
            keywords="nutrition pediatrics obesity",
            study_type="RCT",
            specialty_tags=json.dumps(["Nutrition", "Pediatrics"]),
            publication_year=2020,
            journal="Pediatric Nutrition",
            language="en",
            author_list="Johnson M",
            evidence_level="low",
        ),
    ]


@pytest.fixture
def client(test_db, sample_papers):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    paper_repo = FakePaperRepository(sample_papers)
    vector_repo = FakeVectorRepository(
        hits=[
            ("PMC_NUTRITION_1", 0.95),
            ("PMC_NUTRITION_2", 0.88),
            ("PMC_CARDIO_1", 0.72),
        ]
    )

    def override_get_hybrid_search_service():
        return HybridSearchService(
            db=test_db,
            paper_repository=paper_repo,
            vector_repository=vector_repo,
            embedding_service=FakeEmbeddingService(),
        )

    app.dependency_overrides[get_hybrid_search_service] = override_get_hybrid_search_service

    yield TestClient(app)

    app.dependency_overrides.clear()


def test_hybrid_search_endpoint_returns_results(client):
    response = client.post(
        "/api/search",
        json={"query": "nutrition obesity", "page": 1, "page_size": 10, "sort": "relevance"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["query"] == "nutrition obesity"
    assert body["page"] == 1
    assert body["page_size"] == 10
    assert body["total"] == 3
    assert len(body["items"]) == 3
    assert body["items"][0]["paper_id"] == "PMC_NUTRITION_1"
    assert "semantic_score" in body["items"][0]
    assert "keyword_score" in body["items"][0]
    assert "final_score" in body["items"][0]


def test_hybrid_search_filters_specialty(client):
    response = client.post(
        "/api/search",
        json={
            "query": "nutrition",
            "page": 1,
            "page_size": 10,
            "filters": {"specialties": ["Cardiology"]},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["paper_id"] == "PMC_CARDIO_1"


def test_hybrid_search_filters_study_type_and_year(client):
    response = client.post(
        "/api/search",
        json={
            "query": "nutrition",
            "page": 1,
            "page_size": 10,
            "filters": {
                "study_types": ["RCT"],
                "years": {"from": 2021, "to": 2025},
            },
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["paper_id"] == "PMC_NUTRITION_1"


def test_hybrid_search_pagination(client):
    response = client.post(
        "/api/search",
        json={"query": "nutrition", "page": 2, "page_size": 1, "sort": "title"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["page"] == 2
    assert body["page_size"] == 1
    assert len(body["items"]) == 1


def test_hybrid_search_sort_newest(client):
    response = client.post(
        "/api/search",
        json={"query": "nutrition", "page": 1, "page_size": 10, "sort": "newest"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["items"][0]["paper_id"] == "PMC_NUTRITION_1"  # 2023


def test_hybrid_search_empty_query_rejected_without_filters(client):
    response = client.post(
        "/api/search",
        json={"query": "", "page": 1, "page_size": 10},
    )

    assert response.status_code == 422


def test_hybrid_search_filter_only_returns_results(client):
    response = client.post(
        "/api/search",
        json={
            "query": "",
            "page": 1,
            "page_size": 10,
            "sort": "newest",
            "filters": {"specialties": ["Nutrition"]},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["query"] == ""
    assert body["total"] == 2
    assert all(item["paper_id"] in {"PMC_NUTRITION_1", "PMC_NUTRITION_2"} for item in body["items"])
