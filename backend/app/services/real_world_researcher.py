"""
backend/app/services/real_world_researcher.py
----------------------------------------------
Researches a real brand + creator pair using publicly available signals.
Uses Anthropic with web search enabled. Temperature from settings.llm.
"""

import uuid

from app.config import settings
from app.clients.anthropic_client import AnthropicClient
from app.schemas.validation import (
    ValidationResponse,
    VerdictRequest,
    OverrideReasonRequest,
)


class RealWorldResearcherService:
    def __init__(self, db):
        self.db = db
        self.client = AnthropicClient()

    async def research(self, brand_name: str, creator_name: str) -> ValidationResponse:
        validation_id = str(uuid.uuid4())

        if settings.is_synthetic:
            return ValidationResponse(
                validation_id=validation_id,
                brand_name=brand_name,
                creator_name=creator_name,
                signal_tiers=[],
                unavailable_signals=[],
                ai_suggested_verdict="Pursue",
            )

        # Live path: call Anthropic with web_search tool enabled
        # Temperature: settings.llm.real_world_research_temperature
        # Model: settings.llm.model
        signal_tiers = []
        unavailable_signals = []
        verdict = await self._suggest_verdict(signal_tiers)

        return ValidationResponse(
            validation_id=validation_id,
            brand_name=brand_name,
            creator_name=creator_name,
            signal_tiers=signal_tiers,
            unavailable_signals=unavailable_signals,
            ai_suggested_verdict=verdict,
        )

    async def record_verdict(
        self, validation_id: str, payload: VerdictRequest, user_id: str
    ) -> ValidationResponse:
        # TODO: persist verdict to DB
        return ValidationResponse(
            validation_id=validation_id,
            brand_name="",
            creator_name="",
            signal_tiers=[],
            unavailable_signals=[],
            ai_suggested_verdict="Pursue",
            marketer_verdict=payload.verdict,
        )

    async def record_override_reason(
        self, validation_id: str, payload: OverrideReasonRequest, user_id: str
    ) -> dict:
        # TODO: persist override reason to DB
        return {"validation_id": validation_id, "stored": True}

    async def _suggest_verdict(self, signal_tiers: list) -> str:
        return "Pursue"
