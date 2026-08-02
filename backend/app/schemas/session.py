"""
backend/app/schemas/session.py
-------------------------------
Schemas for session management and scoring diffs.
"""

from typing import List, Optional
from pydantic import BaseModel

from app.schemas.score import ShortlistResponse


class ChangeAnnotation(BaseModel):
    creator_id: str
    channel_name: str
    previous_rank: int
    new_rank: int
    previous_ccms: float
    new_ccms: float
    explanation: str         # plain-language: what changed and why


class ShortlistDiff(BaseModel):
    shortlist: ShortlistResponse
    changes: List[ChangeAnnotation]
    recalculation_trigger: str       # brief_edit | override | manual
