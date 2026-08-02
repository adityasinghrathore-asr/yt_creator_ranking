"""
backend/app/clients/anthropic_client.py
-----------------------------------------
Wrapper around the Anthropic Python SDK.
Model version, max_tokens, and retry settings all come from config.yaml via settings.llm.
Changing the model string in config.yaml is the only change needed to upgrade.
"""

import logging
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = logging.getLogger(__name__)

try:
    import anthropic
    _SDK_AVAILABLE = True
except ImportError:
    _SDK_AVAILABLE = False
    logger.warning("anthropic SDK not installed — LLM calls will be stubbed.")


class AnthropicClient:
    def __init__(self):
        self.model = settings.llm.model
        self.max_tokens = settings.llm.max_tokens
        self.api_key = settings.anthropic_api_key
        if _SDK_AVAILABLE and self.api_key:
            self._client = anthropic.AsyncAnthropic(api_key=self.api_key)
        else:
            self._client = None

    @retry(
        stop=stop_after_attempt(lambda: settings.llm.retry_max_attempts),
        wait=wait_exponential(
            multiplier=lambda: settings.llm.retry_backoff_multiplier,
            min=1,
            max=30,
        ),
        reraise=True,
    )
    async def complete(self, prompt: str, temperature: float = 0.3) -> str:
        """Send a completion request. Falls back to a stub if SDK unavailable."""
        if self._client is None:
            logger.debug("Anthropic client not initialised — returning stub response.")
            return '{"stub": true}'

        message = await self._client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    async def complete_with_web_search(self, prompt: str) -> str:
        """Used for real-world validation research. Enables web search tool."""
        if self._client is None:
            return '{"stub": true}'

        message = await self._client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=settings.llm.real_world_research_temperature,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": prompt}],
        )
        text_blocks = [b.text for b in message.content if hasattr(b, "text")]
        return "\n".join(text_blocks)
