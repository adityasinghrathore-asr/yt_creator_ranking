"""
backend/app/main.py
-------------------
FastAPI application factory.
All configuration comes from app.config.settings (which reads config.yaml).
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import api_router
from app.utils.logging import configure_logging

configure_logging(settings.app.log_level)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app.name,
        version=settings.app.version,
        debug=settings.app.debug,
    )

    # CORS — origins come from config.yaml security.cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.security.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")

    @app.on_event("startup")
    async def startup():
        logger.info(
            "CPI starting — mode=%s env=%s",
            settings.data_mode,
            settings.app.environment,
        )
        if settings.is_synthetic:
            from app.data.loader import load_synthetic_data
            await load_synthetic_data()

    return app


app = create_app()
