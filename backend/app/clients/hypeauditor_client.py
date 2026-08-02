"""
backend/app/clients/hypeauditor_client.py
------------------------------------------
Wrapper around HypeAuditor API. Optional enrichment layer.
Base URL from settings.services.hypeauditor_base_url.
API key from settings.hypeauditor_api_key.
"""

from app.config import settings
from app.schemas.creator import DataUnavailablePlaceholder


class HypeAuditorClient:
    def __init__(self):
        self.base_url = settings.services.hypeauditor_base_url
        self.api_key = settings.hypeauditor_api_key

    async def get_audience_report(self, channel_id: str) -> dict | DataUnavailablePlaceholder:
        if not self.api_key:
            return DataUnavailablePlaceholder(
                signal_name="audience_demographics",
                reason="HypeAuditor API key not configured.",
                suggested_action="Add hypeauditor key to config.yaml api_keys.hypeauditor",
            )
        # TODO: implement API call
        return {}
