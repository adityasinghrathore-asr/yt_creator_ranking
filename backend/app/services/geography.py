"""
backend/app/services/geography.py
-----------------------------------
Portfolio-level geographic coverage logic.
Operates on the ranked shortlist, not on individual creator scores.
"""

from typing import List

from app.schemas.score import CCMSResult, GeographyCoverage


class GeographyService:
    def assess(
        self,
        ranked_creators: List[CCMSResult],
        priority_markets: List[str],
    ) -> GeographyCoverage:
        """
        Check whether the combined shortlist covers all priority markets.
        Identify gaps and surface gap-fill creator recommendations.
        Individual creators are NOT penalised for limited geographic reach.
        """
        # TODO: implement market coverage check using creator audience geo data
        covered: List[str] = []
        gaps: List[str] = [m for m in priority_markets if m not in covered]
        gap_fill_ids: List[str] = []

        return GeographyCoverage(
            priority_markets=priority_markets,
            covered_markets=covered,
            gap_markets=gaps,
            gap_fill_creator_ids=gap_fill_ids,
        )
