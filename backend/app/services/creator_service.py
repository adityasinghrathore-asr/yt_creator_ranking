"""
backend/app/services/creator_service.py
-----------------------------------------
Creator data access layer. Adapter pattern — same interface whether
data comes from synthetic JSON or live YouTube API.
"""

from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.data.loader import get_synthetic_creators
from app.schemas.creator import CreatorProfile


class CreatorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_all(self) -> List[CreatorProfile]:
        if settings.is_synthetic:
            return get_synthetic_creators()
        # TODO: query DB for live-enriched creators
        return []

    async def get_by_id(self, creator_id: str) -> Optional[CreatorProfile]:
        if settings.is_synthetic:
            all_creators = get_synthetic_creators()
            return next((c for c in all_creators if c.creator_id == creator_id), None)
        # TODO: DB lookup
        return None
