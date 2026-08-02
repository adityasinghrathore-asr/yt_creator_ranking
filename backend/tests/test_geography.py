"""
backend/tests/test_geography.py
---------------------------------
Tests for the GeographyService portfolio-level logic.
Individual creators must NOT be penalised for limited geographic reach.
"""

import pytest
from app.services.geography import GeographyService
from app.schemas.score import CCMSResult, DimensionScore, JustificationBlock, GeographyCoverage


def make_result(creator_id: str, rank: int, ccms: float) -> CCMSResult:
    return CCMSResult(
        creator_id=creator_id,
        channel_name=f"Creator {creator_id}",
        rank=rank,
        ccms=ccms,
        partnership_tier="Gold",
        dimension_scores=[],
        justification=JustificationBlock(
            match_summary="",
            dimension_highlights="",
            risks="",
        ),
    )


def test_returns_coverage_object():
    svc = GeographyService()
    results = [make_result("c1", 1, 80.0), make_result("c2", 2, 72.0)]
    coverage = svc.assess(results, priority_markets=["US", "IN"])
    assert isinstance(coverage, GeographyCoverage)
    assert coverage.priority_markets == ["US", "IN"]


def test_all_markets_in_gap_when_no_coverage_data():
    """Without audience geo data, all markets appear in gaps — safe default."""
    svc = GeographyService()
    coverage = svc.assess([], priority_markets=["US", "IN", "GB"])
    assert set(coverage.gap_markets) == {"US", "IN", "GB"}
    assert coverage.covered_markets == []


def test_empty_priority_markets_returns_no_gaps():
    svc = GeographyService()
    coverage = svc.assess([], priority_markets=[])
    assert coverage.gap_markets == []


def test_individual_creators_not_in_coverage_assessment():
    """
    The geographic coverage check operates on the combined portfolio,
    not on individual creator rank scores. Creators should not have their
    CCMS affected by geography.
    """
    svc = GeographyService()
    c1 = make_result("c1", 1, 88.0)
    c2 = make_result("c2", 2, 76.0)
    # Neither creator's CCMS is modified by the geography check
    svc.assess([c1, c2], priority_markets=["US", "DE"])
    assert c1.ccms == 88.0
    assert c2.ccms == 76.0
