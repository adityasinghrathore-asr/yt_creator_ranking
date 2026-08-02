"""
backend/app/clients/perspective_client.py
------------------------------------------
Wrapper around Google Perspective API for toxicity scoring.
Hard-block and soft-flag thresholds come from settings.brand_safety.
API key from settings.perspective_api_key.
"""

from app.config import settings


class PerspectiveClient:
    def __init__(self):
        self.base_url = settings.services.perspective_base_url
        self.api_key = settings.perspective_api_key

    async def score_text(self, text: str, sensitivity: str = "standard") -> dict:
        """
        Returns toxicity, identity_attack, sexually_explicit scores.
        Thresholds applied by the caller (signal_extractor.py) using
        settings.sensitivity_config(sensitivity).
        """
        if not self.api_key:
            return {"toxicity": 0.0, "identity_attack": 0.0, "sexually_explicit": 0.0}
        # TODO: implement httpx call to Perspective API
        return {"toxicity": 0.0, "identity_attack": 0.0, "sexually_explicit": 0.0}
