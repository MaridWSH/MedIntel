"""Pydantic schemas for saved papers and user dashboard."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SavePaperResponse(BaseModel):
    message: str
    paper_id: str


class SavedPaperOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    paper_id: str
    saved_at: datetime
    title: str = ""
    tldr: str = ""
    study_type: str = ""


class SavedPapersListResponse(BaseModel):
    items: list[SavedPaperOut]
    total: int
