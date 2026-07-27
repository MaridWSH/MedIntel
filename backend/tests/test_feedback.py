import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from auth import _RATE_LIMIT_STATE, get_current_admin
from database import Base, get_db
from main import app
from models import ProductFeedbackSubmission, ResearchSurveySubmission, User


@pytest.fixture
def feedback_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = session_factory()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def feedback_client(feedback_db):
    def override_get_db():
        yield feedback_db

    app.dependency_overrides[get_db] = override_get_db
    _RATE_LIMIT_STATE.clear()
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    _RATE_LIMIT_STATE.clear()


def research_payload():
    return {
        "professional_role": "Physician",
        "specialty": "Cardiology",
        "years_experience": "6–10 years",
        "sources": ["PubMed", "Clinical guidelines"],
        "sources_other": "",
        "papers_needed": "4–5",
        "most_time_consuming": "Comparing multiple papers",
        "most_time_consuming_other": "",
        "biggest_problem": "Conflicting findings",
        "biggest_problem_other": "",
        "trust_level": "Maybe",
        "trust_reason": "I would use it to screen papers, but I would verify the source before relying on it.",
        "website": "",
    }


def test_research_survey_is_stored_and_admin_can_read_it(
    feedback_client, feedback_db
):
    response = feedback_client.post(
        "/api/feedback/research-methods", json=research_payload()
    )

    assert response.status_code == 201
    assert response.json()["submission_id"] == 1
    assert feedback_db.query(ResearchSurveySubmission).count() == 1

    app.dependency_overrides[get_current_admin] = lambda: User(
        id=1, email="admin@example.com", name="Admin", hashed_password="unused"
    )
    admin_response = feedback_client.get("/api/feedback/research-methods")

    assert admin_response.status_code == 200
    assert admin_response.json()[0]["sources"] == ["PubMed", "Clinical guidelines"]


def test_research_survey_requires_details_for_other_option(feedback_client):
    payload = research_payload()
    payload["sources"] = ["Other"]

    response = feedback_client.post("/api/feedback/research-methods", json=payload)

    assert response.status_code == 422


def test_product_feedback_is_stored(feedback_client, feedback_db):
    response = feedback_client.post(
        "/api/feedback/product",
        json={
            "overall_rating": 4,
            "ease_of_use_rating": 5,
            "search_rating": 4,
            "summary_rating": 3,
            "features_used": ["Search and discovery", "AI summaries"],
            "most_useful": "The source-linked summaries save time during initial screening.",
            "problems_encountered": "Some filters were difficult to find on mobile.",
            "improvements": "Make active filters more visible.",
            "feature_requests": "Add a side-by-side paper comparison.",
            "would_recommend": "Yes",
            "contact_email": "doctor@example.com",
            "website": "",
        },
    )

    assert response.status_code == 201
    stored = feedback_db.query(ProductFeedbackSubmission).one()
    assert stored.overall_rating == 4
    assert stored.contact_email == "doctor@example.com"


def test_feedback_rejects_unapproved_browser_origin(feedback_client):
    response = feedback_client.post(
        "/api/feedback/research-methods",
        json=research_payload(),
        headers={"Origin": "https://attacker.example"},
    )

    assert response.status_code == 403
