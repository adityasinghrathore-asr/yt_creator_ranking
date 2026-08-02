"""
backend/app/api/v1/brief.py
---------------------------
Routes for campaign brief operations.

POST /brief        — accept brief (form or paste), return AI-extracted signal set
PUT  /brief/{id}   — accept marketer-confirmed signal set, store as authoritative
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.schemas.brief import (
    BriefCreateRequest,
    BriefPasteRequest,
    BriefResponse,
    BriefSignalSet,
)
from app.services.brief_interpreter import BriefInterpreterService

router = APIRouter()


@router.post("", response_model=BriefResponse)
async def create_brief(
    payload: BriefCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Accept a structured brief, run AI interpretation, return signal set for review."""
    service = BriefInterpreterService(db)
    return await service.interpret_structured(payload, user_id=user["sub"])


@router.post("/paste", response_model=BriefResponse)
async def create_brief_from_paste(
    payload: BriefPasteRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Accept free-text paste, pre-fill structured brief via AI, return for review."""
    service = BriefInterpreterService(db)
    return await service.interpret_paste(payload.raw_text, user_id=user["sub"])


@router.put("/{brief_id}", response_model=BriefResponse)
async def confirm_brief(
    brief_id: str,
    signal_set: BriefSignalSet,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Store marketer-confirmed signal set. Ranking will run against this version."""
    service = BriefInterpreterService(db)
    return await service.confirm_signal_set(brief_id, signal_set, user_id=user["sub"])
