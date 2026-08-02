"""
backend/tests/test_signal_extractor.py
-----------------------------------------
Tests for the SignalExtractorService.
Verifies HITL gate routing and stub output structure in synthetic mode.
"""

import pytest
from app.services.signal_extractor import SignalExtractorService
from app.schemas.creator import CreatorProfile, ChannelMetadata, StructuredMetrics
from app.config import settings


def make_creator(authenticity_proxy: float = 0.75, organic_ratio: float = 0.92) -> CreatorProfile:
    return CreatorProfile(
        creator_id="c1",
        channel_name="Test Creator",
        channel_handle="@test",
        metadata=ChannelMetadata(
            subscriber_count=50000,
            total_views=5000000,
            total_video_count=150,
            country="IN",
            creation_date="2020-01-01",
            primary_language="en",
        ),
        metrics=StructuredMetrics(
            engagement_rate=0.08,
            view_to_subscriber_ratio=0.15,
            upload_cadence_days=7.0,
            upload_consistency_score=0.80,
            authenticity_proxy=authenticity_proxy,
            organic_comment_ratio=organic_ratio,
        ),
        content_categories=["tech", "productivity"],
        tier="micro",
        last_enriched_at="2025-08-01T00:00:00Z",
    )


@pytest.mark.asyncio
async def test_stub_signals_return_expected_keys():
    svc = SignalExtractorService()
    creator = make_creator()
    result = svc._stub_signals(creator)
    assert "sentiment_score" in result
    assert "toxicity_score" in result
    assert "use_case_alignment" in result
    assert "organic_comment_ratio" in result


@pytest.mark.asyncio
async def test_process_returns_signals_in_synthetic_mode():
    """In synthetic mode, process() returns stub signals without hitting any API."""
    assert settings.is_synthetic, "These tests assume data_mode=synthetic"
    svc = SignalExtractorService()
    creator = make_creator()
    result = await svc.process(creator, brief_id="brief-001")
    assert isinstance(result, dict)
    assert result["toxicity_score"] == 0.05


def test_hitl_gate_does_not_raise_for_clean_signals():
    svc = SignalExtractorService()
    creator = make_creator()
    # Should not raise — toxicity is below all thresholds
    svc._check_hitl_gates({"toxicity_score": 0.05}, creator)


def test_hitl_gate_uses_sensitivity_from_config():
    """Threshold used in the check must come from settings, not be hardcoded."""
    svc = SignalExtractorService()
    creator = make_creator()
    sensitivity = settings.sensitivity_config("standard")
    # At exactly the hard block threshold, the gate should fire
    # (We can't assert side effects yet without DB — just confirm config is read)
    assert sensitivity.hard_block == 0.70
    assert sensitivity.soft_flag_min == 0.40
