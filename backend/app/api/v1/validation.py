"""
backend/app/api/v1/validation.py
---------------------------------
Routes for the real-world validation experience.

POST /validation                              — submit brand + creator for research
POST /validation/{id}/verdict                 — marketer submits explicit verdict
POST /validation/{id}/override-reason         — capture override reason when verdict differs
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.schemas.validation import (
    ValidationRequest,
    ValidationResponse,
    VerdictRequest,
    OverrideReasonRequest,
)
from app.services.real_world_researcher import RealWorldResearcherService

router = APIRouter()


@router.post("", response_model=ValidationResponse)
async def submit_validation(
    payload: ValidationRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Research brand + creator pair using public signals. Returns structured assessment."""
    service = RealWorldResearcherService(db)
    return await service.research(payload.brand_name, payload.creator_name)


@router.post("/{validation_id}/verdict", response_model=ValidationResponse)
async def submit_verdict(
    validation_id: str,
    payload: VerdictRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Record marketer's explicit Pursue / Reconsider / Reject verdict."""
    service = RealWorldResearcherService(db)
    return await service.record_verdict(validation_id, payload, user_id=user["sub"])


@router.post("/{validation_id}/override-reason")
async def submit_override_reason(
    validation_id: str,
    payload: OverrideReasonRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Store the reason when marketer's verdict differs from AI suggestion."""
    service = RealWorldResearcherService(db)
    return await service.record_override_reason(validation_id, payload, user_id=user["sub"])
