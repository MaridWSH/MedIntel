"""Pydantic schemas for health and readiness probes."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    papers_count: int = 0


class ReadinessResponse(BaseModel):
    status: str
    database: str
    vector_index: str
