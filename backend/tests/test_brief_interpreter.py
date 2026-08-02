"""
backend/tests/test_brief_interpreter.py
-----------------------------------------
Tests for the BriefInterpreterService.
"""

import pytest
from app.services.brief_interpreter import BriefInterpreterService
from app.schemas.brief import BriefCreateRequest


@pytest.mark.asyncio
async def test_interpret_structured_returns_brief_id(db_session):
    service = BriefInterpreterService(db_session)
    brief = BriefCreateRequest(
        campaign_objective="awareness",
        target_audience="Urban professionals 25-40 who commute daily",
        priority_markets=["US", "IN"],
        desired_tone="helpful, candid",
        key_product_messages=["Best-in-class call clarity", "Seamless device switching"],
        things_to_avoid=["competitor mentions"],
    )
    result = await service.interpret_structured(brief, user_id="user-001")
    assert result.brief_id is not None
    assert len(result.brief_id) > 0


@pytest.mark.asyncio
async def test_stub_signal_set_includes_product_messages(db_session):
    service = BriefInterpreterService(db_session)
    brief = BriefCreateRequest(
        campaign_objective="awareness",
        target_audience="Urban professionals 25-40 who commute daily",
        priority_markets=["US", "IN"],
        desired_tone="candid",
        key_product_messages=["Device switching", "Call clarity"],
    )
    result = await service.interpret_structured(brief, user_id="user-001")
    labels = [c.label for c in result.signal_set.primary_use_case_signals]
    assert "Device switching" in labels


@pytest.mark.asyncio
async def test_stub_signal_set_includes_markets(db_session):
    service = BriefInterpreterService(db_session)
    brief = BriefCreateRequest(
        campaign_objective="launch",
        target_audience="Early adopters of consumer electronics",
        priority_markets=["GB", "DE"],
        desired_tone="enthusiastic",
        key_product_messages=["New product"],
    )
    result = await service.interpret_structured(brief, user_id="user-001")
    geo_labels = [c.label for c in result.signal_set.geographic_requirements]
    assert "GB" in geo_labels
    assert "DE" in geo_labels


@pytest.mark.asyncio
async def test_confirm_returns_confirmed_true(db_session):
    service = BriefInterpreterService(db_session)
    brief = BriefCreateRequest(
        campaign_objective="awareness",
        target_audience="Urban professionals 25-40 who commute daily",
        priority_markets=["US"],
        desired_tone="candid",
        key_product_messages=["Call clarity"],
    )
    created = await service.interpret_structured(brief, user_id="user-001")
    confirmed = await service.confirm_signal_set(
        created.brief_id, created.signal_set, user_id="user-001"
    )
    assert confirmed.confirmed is True
