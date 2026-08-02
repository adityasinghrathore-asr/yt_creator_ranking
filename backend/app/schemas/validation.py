"""
backend/app/schemas/validation.py
----------------------------------
Schemas for the real-world validation experience.
"""

from typing import List, Optional
from pydantic import BaseModel

from app.schemas.creator import CreatorSignalTier, DataUnavailablePlaceholder


class ValidationRequest(BaseModel):
    brand_name: str
    creator_name: str


class ValidationResponse(BaseModel):
    validation_id: str
    brand_name: str
    creator_name: str
    signal_tiers: List[CreatorSignalTier]
    unavailable_signals: List[DataUnavailablePlaceholder]
    ai_suggested_verdict: str        # Pursue | Reconsider | Reject
    marketer_verdict: Optional[str] = None
    override_reason: Optional[str] = None
    completed: bool = False


class VerdictRequest(BaseModel):
    verdict: str                     # Pursue | Reconsider | Reject


class OverrideReasonRequest(BaseModel):
    reason: str
    free_text: Optional[str] = None
