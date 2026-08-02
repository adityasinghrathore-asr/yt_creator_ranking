"""
backend/tests/test_scoring_engine.py
--------------------------------------
Tests for the ScoringEngineService.
Verifies CCMS calculation, tier assignment, and weight application from config.
"""

import pytest
from app.services.scoring_engine import ScoringEngineService
from app.config import settings


def test_assign_tier_platinum():
    svc = ScoringEngineService(db=None)
    assert svc._assign_tier(settings.scoring.tiers.platinum_min) == "Platinum"
    assert svc._assign_tier(100.0) == "Platinum"


def test_assign_tier_gold():
    svc = ScoringEngineService(db=None)
    assert svc._assign_tier(settings.scoring.tiers.gold_min) == "Gold"
    assert svc._assign_tier(settings.scoring.tiers.platinum_min - 0.1) == "Gold"


def test_assign_tier_silver():
    svc = ScoringEngineService(db=None)
    assert svc._assign_tier(settings.scoring.tiers.silver_min) == "Silver"


def test_assign_tier_bronze():
    svc = ScoringEngineService(db=None)
    assert svc._assign_tier(settings.scoring.tiers.bronze_min) == "Bronze"


def test_assign_tier_untiered():
    svc = ScoringEngineService(db=None)
    assert svc._assign_tier(0.0) == "Untiered"


def test_dimension_weights_sum_to_100_for_each_objective():
    """Validates that every objective's weights in config.yaml sum to 100."""
    for objective in ["awareness", "engagement", "conversion", "community", "launch"]:
        w = settings.dimension_weights_for(objective)
        total = (
            w.audience_fit
            + w.engagement_quality
            + w.content_style_fit
            + w.brand_safety
            + w.operational_fit
        )
        assert total == 100, f"Weights for '{objective}' sum to {total}, expected 100"


def test_unknown_objective_raises():
    with pytest.raises(ValueError, match="Unknown campaign objective"):
        settings.dimension_weights_for("nonexistent_objective")


@pytest.mark.asyncio
async def test_run_returns_empty_shortlist_when_no_brief(db_session):
    svc = ScoringEngineService(db=db_session)
    result = await svc.run("nonexistent-brief-id")
    assert result.creators == []


@pytest.mark.asyncio
async def test_recalculate_returns_diff(db_session):
    svc = ScoringEngineService(db=db_session)
    diff = await svc.recalculate("nonexistent-brief-id")
    assert diff.changes == []
    assert diff.recalculation_trigger == "brief_edit"
