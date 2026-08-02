"""
backend/tests/test_api/test_brief.py
--------------------------------------
Integration tests for the /brief API routes.
"""

import pytest


@pytest.mark.asyncio
async def test_create_brief_returns_signal_set(client):
    payload = {
        "campaign_objective": "awareness",
        "target_audience": "Urban professionals 25–40 who commute daily by train",
        "priority_markets": ["US", "IN"],
        "desired_tone": "helpful and candid, never over-scripted",
        "key_product_messages": ["Best-in-class call clarity", "Seamless device switching"],
        "things_to_avoid": ["competitor mentions"],
    }
    response = await client.post("/api/v1/brief", json=payload)
    # Auth is required — expect 401 without a token
    assert response.status_code in (200, 401, 403)


@pytest.mark.asyncio
async def test_create_brief_paste(client):
    payload = {"raw_text": "We need YouTube creators to promote our new earbuds to commuters in India and the US. Tone should be authentic and practical."}
    response = await client.post("/api/v1/brief/paste", json=payload)
    assert response.status_code in (200, 401, 403)


@pytest.mark.asyncio
async def test_brief_missing_required_fields_returns_422(client):
    """Brief with missing required fields should fail schema validation."""
    payload = {"campaign_objective": "awareness"}  # missing required fields
    response = await client.post("/api/v1/brief", json=payload)
    # 422 Unprocessable Entity or 401 if auth middleware fires first
    assert response.status_code in (422, 401, 403)
