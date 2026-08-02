"""
backend/app/api/v1/export.py
-----------------------------
Routes for downstream output generation.

POST /export/{shortlist_id}/json     — generate JSON export
POST /export/{shortlist_id}/csv      — generate CSV export
POST /export/{shortlist_id}/approve  — lock shortlist + trigger Jira handoff
"""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.services.export_service import ExportService

router = APIRouter()


@router.post("/{shortlist_id}/json")
async def export_json(
    shortlist_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Generate full JSON export artefact. Returns signed GCS URL."""
    service = ExportService(db)
    url = await service.generate_json(shortlist_id)
    return {"download_url": url}


@router.post("/{shortlist_id}/csv")
async def export_csv(
    shortlist_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Generate flat CSV export. Returns signed GCS URL."""
    service = ExportService(db)
    url = await service.generate_csv(shortlist_id)
    return {"download_url": url}


@router.post("/{shortlist_id}/approve")
async def approve_shortlist(
    shortlist_id: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """
    Lock shortlist version immutably and trigger Jira handoff ticket.
    Jira priority is derived from campaign start date using thresholds in config.yaml.
    """
    service = ExportService(db)
    result = await service.approve_and_handoff(shortlist_id, user_id=user["sub"])
    return result
