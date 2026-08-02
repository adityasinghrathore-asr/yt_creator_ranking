"""
backend/app/services/brief_interpreter.py
------------------------------------------
Reads a submitted brief and extracts the signal set the AI will use to rank creators.
All LLM config (model, temperature, retries) comes from settings.llm.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.clients.anthropic_client import AnthropicClient
from app.schemas.brief import (
    BriefCreateRequest,
    BriefResponse,
    BriefSignalSet,
    SignalChip,
)


class BriefInterpreterService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = AnthropicClient()

    async def interpret_structured(
        self, brief: BriefCreateRequest, user_id: str
    ) -> BriefResponse:
        brief_id = str(uuid.uuid4())
        signal_set = await self._extract_signals(brief_id, brief)
        return BriefResponse(
            brief_id=brief_id,
            campaign_objective=brief.campaign_objective,
            signal_set=signal_set,
            confirmed=False,
        )

    async def interpret_paste(self, raw_text: str, user_id: str) -> BriefResponse:
        """Parse free-text brief into structured fields, then extract signals."""
        brief_id = str(uuid.uuid4())
        # TODO: add LLM call to parse raw_text → BriefCreateRequest fields
        # For now return a stub signal set
        signal_set = BriefSignalSet(
            brief_id=brief_id,
            primary_use_case_signals=[],
            secondary_category_signals=[],
            audience_descriptors=[],
            geographic_requirements=[],
            tone_preferences=[],
            avoid_signals=[],
        )
        return BriefResponse(
            brief_id=brief_id,
            campaign_objective="awareness",
            signal_set=signal_set,
            confirmed=False,
        )

    async def confirm_signal_set(
        self, brief_id: str, signal_set: BriefSignalSet, user_id: str
    ) -> BriefResponse:
        """Store the marketer-confirmed signal set as authoritative."""
        # TODO: persist to DB
        return BriefResponse(
            brief_id=brief_id,
            campaign_objective="awareness",
            signal_set=signal_set,
            confirmed=True,
        )

    async def _extract_signals(
        self, brief_id: str, brief: BriefCreateRequest
    ) -> BriefSignalSet:
        """
        Call the Anthropic API to extract structured signals from the brief.
        Temperature and model come from settings.llm.
        """
        if settings.is_synthetic:
            # Return a deterministic stub for the showcase
            return self._stub_signal_set(brief_id, brief)

        prompt = self._build_extraction_prompt(brief)
        response = await self.client.complete(
            prompt=prompt,
            temperature=settings.llm.brief_interpretation_temperature,
        )
        return self._parse_signal_response(brief_id, response)

    def _stub_signal_set(
        self, brief_id: str, brief: BriefCreateRequest
    ) -> BriefSignalSet:
        return BriefSignalSet(
            brief_id=brief_id,
            primary_use_case_signals=[
                SignalChip(
                    id=str(uuid.uuid4()),
                    label=msg,
                    category="use_case",
                    source="ai_extracted",
                )
                for msg in brief.key_product_messages[:3]
            ],
            secondary_category_signals=[],
            audience_descriptors=[
                SignalChip(
                    id=str(uuid.uuid4()),
                    label=brief.target_audience[:60],
                    category="audience",
                    source="ai_extracted",
                )
            ],
            geographic_requirements=[
                SignalChip(
                    id=str(uuid.uuid4()),
                    label=market,
                    category="geography",
                    source="ai_extracted",
                )
                for market in brief.priority_markets
            ],
            tone_preferences=[
                SignalChip(
                    id=str(uuid.uuid4()),
                    label=brief.desired_tone,
                    category="tone",
                    source="ai_extracted",
                )
            ],
            avoid_signals=[
                SignalChip(
                    id=str(uuid.uuid4()),
                    label=item,
                    category="avoid",
                    source="ai_extracted",
                )
                for item in brief.things_to_avoid
            ],
        )

    def _build_extraction_prompt(self, brief: BriefCreateRequest) -> str:
        return f"""
You are analysing a campaign brief to extract the specific signals that will be used
to evaluate YouTube creators. Return a JSON object matching the BriefSignalSet schema.

Campaign objective: {brief.campaign_objective}
Target audience: {brief.target_audience}
Priority markets: {', '.join(brief.priority_markets)}
Desired tone: {brief.desired_tone}
Key product messages: {'; '.join(brief.key_product_messages)}
Things to avoid: {'; '.join(brief.things_to_avoid)}

Extract: primary use-case signals, secondary category signals, audience descriptors,
geographic requirements, tone preferences, and avoid signals.
Every chip must have a concise label (≤8 words), a category, and source=ai_extracted.
"""

    def _parse_signal_response(self, brief_id: str, response: str) -> BriefSignalSet:
        # TODO: parse LLM JSON response into BriefSignalSet
        return BriefSignalSet(
            brief_id=brief_id,
            primary_use_case_signals=[],
            secondary_category_signals=[],
            audience_descriptors=[],
            geographic_requirements=[],
            tone_preferences=[],
            avoid_signals=[],
        )
