"""
backend/app/api/v1/scoring.py
------------------------------
Routes for scoring and ranking operations.

POST /scoring/run                    — run full ranking for a confirmed brief
POST /scoring/recalculate            — re-rank after brief edit, return diff
PUT  /scoring/{creator_id}/override  — manual score override with justification
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.schemas.score import ShortlistResponse
from app.schemas.session import ShortlistDiff
from app.schemas.score import OverrideRequest
from app.services.scoring_engine import ScoringEngineService

router = APIRouter()


@router.post("/run", response_model=ShortlistResponse)
async def run_scoring(
    brief_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """
    Run full ranking computation against the confirmed brief signal set.
    Dimension weights are loaded from config.yaml via settings.dimension_weights_for().
    """
    service = ScoringEngineService(db)
    return await service.run(brief_id)


@router.post("/recalculate", response_model=ShortlistDiff)
async def recalculate_scoring(
    brief_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Re-rank after a brief update. Returns new shortlist + change annotations."""
    service = ScoringEngineService(db)
    return await service.recalculate(brief_id)


@router.put("/{creator_id}/override", response_model=ShortlistResponse)
async def override_score(
    creator_id: str,
    payload: OverrideRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """
    Apply a manual CCMS or dimension score override.
    Requires a justification string. Logged immutably.
    """
    service = ScoringEngineService(db)
    return await service.apply_override(creator_id, payload, user_id=user["sub"])
