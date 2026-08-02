"""
backend/app/api/v1/router.py
----------------------------
Registers all v1 route groups under the /api/v1 prefix.
"""

from fastapi import APIRouter

from app.api.v1 import brief, creators, scoring, validation, export

api_router = APIRouter()

api_router.include_router(brief.router, prefix="/brief", tags=["brief"])
api_router.include_router(creators.router, prefix="/creators", tags=["creators"])
api_router.include_router(scoring.router, prefix="/scoring", tags=["scoring"])
api_router.include_router(validation.router, prefix="/validation", tags=["validation"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
