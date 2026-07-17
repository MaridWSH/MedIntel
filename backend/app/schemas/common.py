"""Shared/common Pydantic schemas."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    papers_count: int = 0
