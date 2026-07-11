import json

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from api.dependencies import get_semantic_search_service
from auth import create_access_token, hash_password
from database import Base, get_db
from main import app
from models import User
from services.semantic_search_service import SemanticSearchResult


class FakePaper:
    def __init__(
        self,
        id: str,
        title: str,
        tldr: str,
        detailed_summary: str,
        study_type: str,
        specialty_tags: str,
        journal: str,
        doi: str,
        author_list: str,
        authors_count: int,
        centers_count: int,
        key_findings: str,
        sample_size: str,
    ):
        self.id = id
        self.title = title
        self.tldr = tldr
        self.detailed_summary = detailed_summary
        self.study_type = study_type
        self.specialty_tags = specialty_tags
        self.journal = journal
        self.doi = doi
        self.author_list = author_list
        self.authors_count = authors_count
        self.centers_count = centers_count
        self.key_findings = key_findings
        self.sample_size = sample_size


class FakeSemanticSearchService:
    def __init__(self, paper: FakePaper):
        self._paper = paper

    def search(self, query: str, top_k: int = 10, filters: dict | None = None):
        return [SemanticSearchResult(paper=self._paper, score=1.0)]


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
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    sample_user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=hash_password("password123"),
    )
    test_db.add(sample_user)
    test_db.commit()
    test_db.refresh(sample_user)

    sample_paper = FakePaper(
        id="PMC10000023",
        title="Rotational Grazing Modifies Rhipicephalus microplus Infestation in Cattle in the Humid Tropics",
        tldr=(
            "In this year-long field experiment in heifers in the humid tropics, rotational grazing with a 45-day pasture rest "
            "was associated with the lowest Rhipicephalus microplus infestation, while a 30-day rest produced the highest tick burdens. "
            "The main practical finding is that 30 days of pasture rest was not enough to reduce tick infestation, but 45 days appeared beneficial "
            "under these conditions. This is clinically relevant for cattle health and farm management because it suggests a non-chemical strategy "
            "that may help reduce acaricide use and chemical residues in milk, meat, and the environment."
        ),
        detailed_summary="Detailed paper content.",
        study_type="other",
        specialty_tags=json.dumps([
            "veterinary medicine",
            "parasitology",
            "livestock production",
            "tropical medicine",
        ]),
        journal="Animals : an Open Access Journal from MDPI",
        doi="10.3390/ani13050915",
        author_list=(
            "Gabriel Cruz-González, Juan Manuel Pinos-Rodríguez, Miguel Ángel Alonso-Díaz, Dora Romero-Salas, "
            "Jorge Genaro Vicente-Martínez, Agustin Fernández-Salas, Jesús Jarillo-Rodríguez, Epigmenio Castillo-Gallegos"
        ),
        authors_count=8,
        centers_count=2,
        key_findings=json.dumps({"overall_evidence_level": "low", "sample_size": "N=30"}),
        sample_size="N=30",
    )

    def override_get_semantic_search_service():
        return FakeSemanticSearchService(sample_paper)

    app.dependency_overrides[get_semantic_search_service] = override_get_semantic_search_service

    yield TestClient(app)

    app.dependency_overrides.clear()


def test_semantic_search_endpoint_requires_authorization(client):
    response = client.post(
        "/api/search",
        json={"query": "obesity", "top_k": 5},
    )

    assert response.status_code == 401


def test_semantic_search_endpoint_returns_results_with_valid_token(client, test_db):
    user = test_db.query(User).filter(User.email == "test@example.com").first()
    token = create_access_token({"sub": str(user.id)})

    response = client.post(
        "/api/search",
        headers={"Authorization": f"Bearer {token}"},
        json={"query": "obesity", "top_k": 5},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["query"] == "obesity"
    assert body["top_k"] == 5
    assert body["total"] == 1
    assert body["items"][0]["id"] == "PMC10000023"
    assert body["items"][0]["title"] == "Rotational Grazing Modifies Rhipicephalus microplus Infestation in Cattle in the Humid Tropics"
    assert body["items"][0]["journal"] == "Animals : an Open Access Journal from MDPI"
    assert body["items"][0]["doi"] == "10.3390/ani13050915"
    assert body["items"][0]["authors_count"] == 8
    assert body["items"][0]["centers_count"] == 2
    assert body["items"][0]["overall_evidence_level"] == "low"
    assert body["items"][0]["sample_size"] == "N=30"
