"""
backend/app/schemas/creator.py
-------------------------------
Pydantic v2 schemas for creator data.
"""

from typing import List, Optional
from pydantic import BaseModel


class DataUnavailablePlaceholder(BaseModel):
    """A signal that could not be populated. Reason is always specific, never generic."""
    signal_name: str
    reason: str
    suggested_action: Optional[str] = None


class CreatorSignalTier(BaseModel):
    """
    A single evaluated signal dimension.
    tier: High | Medium | Low
    evidence: plain-language explanation
    inference_source: what data produced this tier
    """
    dimension: str
    tier: str                        # High | Medium | Low
    evidence: str
    inference_source: str
    unavailable: Optional[DataUnavailablePlaceholder] = None


class ChannelMetadata(BaseModel):
    subscriber_count: int
    total_views: int
    total_video_count: int
    country: str
    creation_date: str
    primary_language: str


class StructuredMetrics(BaseModel):
    engagement_rate: float           # (likes + comments) / views
    view_to_subscriber_ratio: float  # avg views / subscribers
    upload_cadence_days: float       # avg days between uploads
    upload_consistency_score: float  # inverse CoV of upload gaps
    authenticity_proxy: float        # structural signal, see design doc §2.2
    organic_comment_ratio: Optional[float] = None
    data_quality_score: float = 1.0


class CreatorProfile(BaseModel):
    creator_id: str
    channel_name: str
    channel_handle: str
    thumbnail_url: Optional[str] = None
    metadata: ChannelMetadata
    metrics: StructuredMetrics
    content_categories: List[str]
    tier: str                        # nano | micro | mid | macro
    last_enriched_at: str
    transcript_available: bool = True
    cold_start: bool = False
