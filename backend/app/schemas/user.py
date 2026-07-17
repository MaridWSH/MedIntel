"""User/saved-paper-related Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel


class SavePaperResponse(BaseModel):
    message: str
    paper_id: str


class SavedPaperOut(BaseModel):
    paper_id: str
    saved_at: datetime

    class Config:
        from_attributes = True


class SavedPapersListResponse(BaseModel):
    items: list[SavedPaperOut]
    total: int
