"""Pydantic schemas for research and product feedback submissions."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


ResearchRole = Literal[
    "Physician",
    "Resident or fellow",
    "Medical student",
    "Clinical researcher",
    "Other",
]
ExperienceRange = Literal[
    "Less than 1 year",
    "1–5 years",
    "6–10 years",
    "11–20 years",
    "More than 20 years",
    "Not applicable",
]
ResearchSource = Literal[
    "PubMed",
    "Google Scholar",
    "Clinical guidelines",
    "Journal websites",
    "Point-of-care tools",
    "Colleagues",
    "AI tools",
    "Other",
]
PapersNeeded = Literal["1", "2–3", "4–5", "6–10", "More than 10", "It varies"]
TimeConsumingTask = Literal[
    "Finding relevant papers",
    "Reading full papers",
    "Extracting key results",
    "Assessing study quality",
    "Comparing multiple papers",
    "Managing citations and notes",
    "Other",
]
ResearchProblem = Literal[
    "Too many irrelevant results",
    "Paywalls or unavailable full text",
    "Not enough time",
    "Difficulty assessing quality",
    "Complex statistics or terminology",
    "Conflicting findings",
    "Outdated information",
    "Other",
]
YesMaybeNo = Literal["Yes", "Maybe", "No"]


class ResearchSurveyCreate(BaseModel):
    professional_role: ResearchRole
    specialty: str = Field("", max_length=150)
    years_experience: ExperienceRange
    sources: list[ResearchSource] = Field(min_length=1, max_length=8)
    sources_other: str = Field("", max_length=500)
    papers_needed: PapersNeeded
    most_time_consuming: TimeConsumingTask
    most_time_consuming_other: str = Field("", max_length=500)
    biggest_problem: ResearchProblem
    biggest_problem_other: str = Field("", max_length=500)
    trust_level: YesMaybeNo
    trust_reason: str = Field(min_length=10, max_length=2000)
    website: str = Field("", max_length=200)

    @field_validator(
        "specialty",
        "sources_other",
        "most_time_consuming_other",
        "biggest_problem_other",
        "trust_reason",
        "website",
    )
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def require_other_details(self):
        if "Other" in self.sources and not self.sources_other:
            raise ValueError("Please describe the other source you use")
        if self.most_time_consuming == "Other" and not self.most_time_consuming_other:
            raise ValueError("Please describe the other time-consuming task")
        if self.biggest_problem == "Other" and not self.biggest_problem_other:
            raise ValueError("Please describe the other research problem")
        return self


class ProductFeedbackCreate(BaseModel):
    overall_rating: int = Field(ge=1, le=5)
    ease_of_use_rating: int = Field(ge=1, le=5)
    search_rating: int | None = Field(None, ge=1, le=5)
    summary_rating: int | None = Field(None, ge=1, le=5)
    features_used: list[Literal[
        "Search and discovery",
        "AI summaries",
        "Key findings",
        "Concept maps",
        "Full paper view",
        "Saved papers",
        "Citation export",
    ]] = Field(default_factory=list, max_length=7)
    most_useful: str = Field("", max_length=1500)
    problems_encountered: str = Field("", max_length=3000)
    improvements: str = Field("", max_length=3000)
    feature_requests: str = Field("", max_length=3000)
    would_recommend: YesMaybeNo
    contact_email: EmailStr | None = None
    website: str = Field("", max_length=200)

    @field_validator(
        "most_useful",
        "problems_encountered",
        "improvements",
        "feature_requests",
        "website",
    )
    @classmethod
    def strip_feedback_text(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def require_written_feedback(self):
        if not any((self.most_useful, self.problems_encountered, self.improvements, self.feature_requests)):
            raise ValueError("Please provide at least one written feedback response")
        return self


class FeedbackSubmissionResponse(BaseModel):
    message: str
    submission_id: int | None = None


class ResearchSurveyOut(BaseModel):
    id: int
    professional_role: str
    specialty: str
    years_experience: str
    sources: list[str]
    sources_other: str
    papers_needed: str
    most_time_consuming: str
    most_time_consuming_other: str
    biggest_problem: str
    biggest_problem_other: str
    trust_level: str
    trust_reason: str
    created_at: datetime


class ProductFeedbackOut(BaseModel):
    id: int
    overall_rating: int
    ease_of_use_rating: int
    search_rating: int | None
    summary_rating: int | None
    features_used: list[str]
    most_useful: str
    problems_encountered: str
    improvements: str
    feature_requests: str
    would_recommend: str
    contact_email: str
    created_at: datetime
