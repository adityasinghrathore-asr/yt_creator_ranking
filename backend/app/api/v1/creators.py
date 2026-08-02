"""
backend/app/api/v1/creators.py
-------------------------------
Routes for creator data access.
In synthetic mode these serve from the pre-loaded JSON.
In live mode the adapter is swapped; route handlers do not change.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.schemas.creator import CreatorProfile
from app.services.creator_service import CreatorService

router = APIRouter()


@router.get("", response_model=List[CreatorProfile])
async def list_creators(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Return the full creator pool available for the current data mode."""
    service = CreatorService(db)
    return await service.list_all()


@router.get("/{creator_id}", response_model=CreatorProfile)
async def get_creator(
    creator_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Return a single enriched creator profile."""
    service = CreatorService(db)
    creator = await service.get_by_id(creator_id)
    if not creator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator not found")
    return creator
