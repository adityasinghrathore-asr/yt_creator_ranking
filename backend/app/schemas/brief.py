"""
backend/app/schemas/brief.py
----------------------------
Pydantic v2 schemas for campaign brief request/response payloads.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class BriefCreateRequest(BaseModel):
    campaign_objective: str = Field(
        ...,
        description="awareness | engagement | conversion | community | launch",
    )
    target_audience: str = Field(..., min_length=20)
    priority_markets: List[str] = Field(..., min_items=1)
    desired_tone: str = Field(..., min_length=5)
    key_product_messages: List[str] = Field(..., min_items=1)
    content_format_preferences: List[str] = Field(default_factory=list)
    things_to_avoid: List[str] = Field(default_factory=list)
    creator_tier_preferences: List[str] = Field(default_factory=list)
    shortlist_size_target: int = Field(default=10, ge=3, le=30)
    min_engagement_rate: Optional[float] = None
    creator_blacklist: List[str] = Field(default_factory=list)
    creator_whitelist: List[str] = Field(default_factory=list)
    brand_safety_sensitivity: str = Field(
        default="standard",
        description="standard | elevated | strict",
    )
    per_creator_budget_ceiling: Optional[float] = None
    campaign_start_date: Optional[str] = None


class BriefPasteRequest(BaseModel):
    raw_text: str = Field(..., min_length=50)


class SignalChip(BaseModel):
    id: str
    label: str
    category: str          # use_case | audience | tone | geography | avoid
    source: str            # ai_extracted | marketer_added | marketer_edited
    confidence: float = 1.0


class BriefSignalSet(BaseModel):
    """
    The AI-extracted or marketer-confirmed set of signals used to rank creators.
    This is what the marketer sees and edits on the confirmation screen.
    """
    brief_id: str
    primary_use_case_signals: List[SignalChip]
    secondary_category_signals: List[SignalChip]
    audience_descriptors: List[SignalChip]
    geographic_requirements: List[SignalChip]
    tone_preferences: List[SignalChip]
    avoid_signals: List[SignalChip]


class BriefResponse(BaseModel):
    brief_id: str
    campaign_objective: str
    signal_set: BriefSignalSet
    confirmed: bool = False
    version: int = 1
