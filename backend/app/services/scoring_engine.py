"""
backend/app/services/scoring_engine.py
----------------------------------------
Core ranking service. All dimension weights and thresholds come from config.yaml
via settings. Changing a weight in config.yaml is enough — no code change needed.
"""

import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.schemas.brief import BriefSignalSet
from app.schemas.creator import CreatorProfile
from app.schemas.score import (
    CCMSResult,
    DimensionScore,
    GeographyCoverage,
    JustificationBlock,
    OverrideRequest,
    ShortlistResponse,
)
from app.schemas.session import ChangeAnnotation, ShortlistDiff
from app.services.geography import GeographyService


class ScoringEngineService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.geo_service = GeographyService()

    async def run(self, brief_id: str) -> ShortlistResponse:
        """
        Full ranking run:
        1. Load confirmed brief signal set
        2. Load creator pool
        3. Hard filter pass
        4. Score each surviving creator (two-pass: structured then transcript)
        5. Sort by CCMS descending
        6. Assign partnership tiers from config thresholds
        7. Geographic portfolio check
        """
        # TODO: load from DB
        creators: List[CreatorProfile] = []
        signal_set: BriefSignalSet = None  # type: ignore

        if signal_set is None:
            return self._empty_shortlist(brief_id)

        objective = signal_set.brief_id  # placeholder — load from brief
        weights = settings.dimension_weights_for(objective)

        filtered = self._hard_filter(creators)
        scored = [self._score_creator(c, signal_set, weights) for c in filtered]
        scored.sort(key=lambda r: r.ccms, reverse=True)

        for i, result in enumerate(scored):
            result.rank = i + 1
            result.partnership_tier = self._assign_tier(result.ccms)

        geography = self.geo_service.assess(scored, priority_markets=[])

        return ShortlistResponse(
            shortlist_id=str(uuid.uuid4()),
            brief_id=brief_id,
            version=1,
            creators=scored,
            geography=geography,
        )

    async def recalculate(self, brief_id: str) -> ShortlistDiff:
        """Re-rank and produce a diff against the previous shortlist."""
        new_shortlist = await self.run(brief_id)
        # TODO: load previous shortlist from DB and diff
        changes: List[ChangeAnnotation] = []
        return ShortlistDiff(
            shortlist=new_shortlist,
            changes=changes,
            recalculation_trigger="brief_edit",
        )

    async def apply_override(
        self, creator_id: str, payload: OverrideRequest, user_id: str
    ) -> ShortlistResponse:
        """Apply manual override, log immutably, return updated shortlist."""
        # TODO: persist override to DB, reload and re-sort shortlist
        return self._empty_shortlist(payload.brief_id)

    # ------------------------------------------------------------------
    # Internal scoring helpers
    # ------------------------------------------------------------------

    def _hard_filter(self, creators: List[CreatorProfile]) -> List[CreatorProfile]:
        """
        Binary filter. Exclusion reasons are logged but not surfaced here.
        Thresholds from config: ingestion.min_videos_in_90_days, brand_safety thresholds.
        """
        # TODO: implement filter logic
        return creators

    def _score_creator(
        self,
        creator: CreatorProfile,
        signal_set: BriefSignalSet,
        weights,
    ) -> CCMSResult:
        """Compute all five dimension scores and the composite CCMS."""
        # Weights come from config.yaml via settings.dimension_weights_for()
        d1 = self._score_audience_fit(creator) * (weights.audience_fit / 100)
        d2 = self._score_engagement_quality(creator) * (weights.engagement_quality / 100)
        d3 = self._score_content_style(creator, signal_set) * (weights.content_style_fit / 100)
        d4 = self._score_brand_safety(creator) * (weights.brand_safety / 100)
        d5 = self._score_operational_fit(creator) * (weights.operational_fit / 100)

        ccms = (d1 + d2 + d3 + d4 + d5) * 100

        dimension_scores = [
            DimensionScore(dimension="audience_fit", raw_score=d1 * 100 / (weights.audience_fit / 100) if weights.audience_fit else 0, weight=weights.audience_fit / 100, weighted_contribution=d1 * 100),
            DimensionScore(dimension="engagement_quality", raw_score=d2 * 100 / (weights.engagement_quality / 100) if weights.engagement_quality else 0, weight=weights.engagement_quality / 100, weighted_contribution=d2 * 100),
            DimensionScore(dimension="content_style_fit", raw_score=d3 * 100 / (weights.content_style_fit / 100) if weights.content_style_fit else 0, weight=weights.content_style_fit / 100, weighted_contribution=d3 * 100),
            DimensionScore(dimension="brand_safety", raw_score=d4 * 100 / (weights.brand_safety / 100) if weights.brand_safety else 0, weight=weights.brand_safety / 100, weighted_contribution=d4 * 100),
            DimensionScore(dimension="operational_fit", raw_score=d5 * 100 / (weights.operational_fit / 100) if weights.operational_fit else 0, weight=weights.operational_fit / 100, weighted_contribution=d5 * 100),
        ]

        return CCMSResult(
            creator_id=creator.creator_id,
            channel_name=creator.channel_name,
            rank=0,  # set after sort
            ccms=round(ccms, 1),
            partnership_tier="",  # set after sort
            dimension_scores=dimension_scores,
            justification=JustificationBlock(
                match_summary="Pending justification generation.",
                dimension_highlights="",
                risks="",
            ),
        )

    def _score_audience_fit(self, creator: CreatorProfile) -> float:
        # TODO: implement demographic overlap, geo match, interest alignment
        return 0.7

    def _score_engagement_quality(self, creator: CreatorProfile) -> float:
        # Tier-normalised; uses creator.metrics.engagement_rate
        # VRS floor from config: settings.ingestion.vsr_floor_percent
        return min(creator.metrics.engagement_rate * 10, 1.0)

    def _score_content_style(
        self, creator: CreatorProfile, signal_set: BriefSignalSet
    ) -> float:
        return 0.7

    def _score_brand_safety(self, creator: CreatorProfile) -> float:
        # Authenticity proxy floor from config: settings.brand_safety.authenticity_proxy_min
        proxy = creator.metrics.authenticity_proxy
        if proxy < settings.brand_safety.authenticity_proxy_min:
            return 0.3
        return proxy

    def _score_operational_fit(self, creator: CreatorProfile) -> float:
        return creator.metrics.upload_consistency_score

    def _assign_tier(self, ccms: float) -> str:
        """Map CCMS to partnership tier using thresholds from config.yaml."""
        tiers = settings.scoring.tiers
        if ccms >= tiers.platinum_min:
            return "Platinum"
        if ccms >= tiers.gold_min:
            return "Gold"
        if ccms >= tiers.silver_min:
            return "Silver"
        if ccms >= tiers.bronze_min:
            return "Bronze"
        return "Untiered"

    def _empty_shortlist(self, brief_id: str) -> ShortlistResponse:
        return ShortlistResponse(
            shortlist_id=str(uuid.uuid4()),
            brief_id=brief_id,
            version=1,
            creators=[],
            geography=GeographyCoverage(
                priority_markets=[],
                covered_markets=[],
                gap_markets=[],
                gap_fill_creator_ids=[],
            ),
        )
