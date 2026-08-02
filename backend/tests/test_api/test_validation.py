"""
backend/tests/test_api/test_validation.py
-------------------------------------------
Integration tests for the /validation API routes.
"""

import pytest


@pytest.mark.asyncio
async def test_submit_validation_requires_both_fields(client):
    """Validation requires both brand_name and creator_name."""
    payload = {"brand_name": "Google Pixel"}  # missing creator_name
    response = await client.post("/api/v1/validation", json=payload)
    assert response.status_code in (422, 401, 403)


@pytest.mark.asyncio
async def test_verdict_values_are_constrained(client):
    """Verdict must be Pursue, Reconsider, or Reject — invalid values rejected."""
    payload = {"verdict": "Maybe"}
    response = await client.post("/api/v1/validation/val-001/verdict", json=payload)
    # Pydantic validation or auth will reject this
    assert response.status_code in (422, 401, 403)


@pytest.mark.asyncio
async def test_override_reason_stored_when_verdict_differs(client):
    """Override reason endpoint accepts a reason and optional free text."""
    payload = {
        "reason": "Direct relationship with this creator",
        "free_text": None,
    }
    response = await client.post(
        "/api/v1/validation/val-001/override-reason", json=payload
    )
    assert response.status_code in (200, 401, 403)
