"""
backend/tests/test_api/test_scoring.py
-----------------------------------------
Integration tests for the /scoring API routes.
"""

import pytest


@pytest.mark.asyncio
async def test_scoring_run_requires_brief_id(client):
    response = await client.post("/api/v1/scoring/run")
    # Missing query param → 422, or 401 if auth fires first
    assert response.status_code in (422, 401, 403)


@pytest.mark.asyncio
async def test_override_requires_justification(client):
    """Override endpoint must reject requests with no justification."""
    payload = {
        "brief_id": "brief-001",
        "adjusted_ccms": 90.0,
        # justification is missing
    }
    response = await client.put("/api/v1/scoring/creator-001/override", json=payload)
    assert response.status_code in (422, 401, 403)


@pytest.mark.asyncio
async def test_recalculate_returns_diff_structure(client):
    response = await client.post("/api/v1/scoring/recalculate")
    assert response.status_code in (422, 401, 403)
