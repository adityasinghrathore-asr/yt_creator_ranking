"""
backend/app/services/justification_generator.py
-------------------------------------------------
Generates the three-part AI justification for each creator card.
Word limits and LLM config come from config.yaml (settings.llm.justification_word_limits).
"""

from app.config import settings
from app.clients.anthropic_client import AnthropicClient
from app.schemas.score import CCMSResult, JustificationBlock


class JustificationGeneratorService:
    def __init__(self):
        self.client = AnthropicClient()
        self.limits = settings.llm.justification_word_limits

    async def generate(self, result: CCMSResult, brief_signals: dict) -> JustificationBlock:
        if settings.is_synthetic:
            return self._stub_justification(result)

        prompt = self._build_prompt(result, brief_signals)
        response = await self.client.complete(
            prompt=prompt,
            temperature=settings.llm.justification_temperature,
        )
        return self._parse(response)

    def _stub_justification(self, result: CCMSResult) -> JustificationBlock:
        return JustificationBlock(
            match_summary=(
                f"{result.channel_name} aligns with the campaign's core use case "
                "through consistent content themes and an engaged community."
            ),
            dimension_highlights=(
                "Engagement quality is above tier average. "
                "Content style closely matches the desired tone. "
                "Brand safety signals are clean across recent content."
            ),
            risks=(
                "Inference based on public content only. "
                "Commercial effectiveness cannot be predicted from these signals. "
                "Verify sponsorship rate before outreach."
            ),
        )

    def _build_prompt(self, result: CCMSResult, brief_signals: dict) -> str:
        limits = self.limits
        return f"""
Generate a three-part justification for a creator partnership recommendation.
Tone: analyst-grade, direct, no superlatives. Every claim must be grounded only
in the provided signal data. Do not invent or embellish.

Creator: {result.channel_name}
CCMS: {result.ccms}
Dimensions: {[d.model_dump() for d in result.dimension_scores]}
Brief signals: {brief_signals}

Return JSON with:
  match_summary     — ≤{limits.match_summary} words
  dimension_highlights — ≤{limits.dimension_highlights} words
  risks             — ≤{limits.risks} words

The risks section MUST include: "Inference based on public content only.
Commercial effectiveness cannot be predicted from these signals."
"""

    def _parse(self, response: str) -> JustificationBlock:
        import json
        try:
            data = json.loads(response)
            return JustificationBlock(**data)
        except Exception:
            return JustificationBlock(
                match_summary="Justification unavailable.",
                dimension_highlights="",
                risks="Inference based on public content only.",
            )
