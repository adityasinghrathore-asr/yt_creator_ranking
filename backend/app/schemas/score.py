"""
backend/app/schemas/score.py
----------------------------
Pydantic v2 schemas for scoring outputs.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


class DimensionScore(BaseModel):
    dimension: str
    raw_score: float
    weight: float                   # from config.yaml dimension_weights
    weighted_contribution: float


class JustificationBlock(BaseModel):
    match_summary: str              # ≤60 words
    dimension_highlights: str       # ≤120 words
    risks: str                      # ≤80 words


class OverrideMetadata(BaseModel):
    original_ccms: float
    adjusted_ccms: float
    justification: str
    overridden_by: str
    overridden_at: str


class CCMSResult(BaseModel):
    creator_id: str
    channel_name: str
    rank: int
    ccms: float
    partnership_tier: str            # Platinum | Gold | Silver | Bronze
    dimension_scores: List[DimensionScore]
    justification: JustificationBlock
    campaign_concept: Optional[str] = None
    hitl_status: str = "cleared"     # cleared | pending_review | flagged
    override: Optional[OverrideMetadata] = None
    transcript_evaluated: bool = True
    data_quality_score: float = 1.0


class GeographyCoverage(BaseModel):
    priority_markets: List[str]
    covered_markets: List[str]
    gap_markets: List[str]
    gap_fill_creator_ids: List[str]


class ShortlistResponse(BaseModel):
    shortlist_id: str
    brief_id: str
    version: int
    creators: List[CCMSResult]
    geography: GeographyCoverage
    scoring_model_version: str = "0.1.0"


class OverrideRequest(BaseModel):
    brief_id: str
    adjusted_ccms: Optional[float] = None
    adjusted_dimensions: Optional[Dict[str, float]] = None
    justification: str
