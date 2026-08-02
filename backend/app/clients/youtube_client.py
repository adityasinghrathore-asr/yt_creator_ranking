"""
backend/app/clients/youtube_client.py
---------------------------------------
Wrapper around YouTube Data API v3.
Quota alert threshold comes from settings.youtube_quota.global_alert_threshold.
API key from settings.youtube_api_key.
"""

import logging
from app.config import settings

logger = logging.getLogger(__name__)

try:
    import httpx
    _HTTPX_AVAILABLE = True
except ImportError:
    _HTTPX_AVAILABLE = False


class YouTubeClient:
    BASE_URL = "https://www.googleapis.com/youtube/v3"

    def __init__(self):
        self.api_key = settings.youtube_api_key
        self._quota_used = 0

    def _check_quota(self, units: int):
        self._quota_used += units
        if self._quota_used >= settings.youtube_quota.global_alert_threshold:
            logger.warning(
                "YouTube API quota alert: %d units consumed (threshold: %d)",
                self._quota_used,
                settings.youtube_quota.global_alert_threshold,
            )

    async def get_channel(self, channel_id: str) -> dict:
        self._check_quota(1)
        # TODO: implement httpx call to channels.list
        return {}

    async def get_videos(self, channel_id: str, max_results: int = 30) -> list:
        self._check_quota(max_results)
        return []

    async def get_comments(self, video_id: str, max_results: int = 20) -> list:
        self._check_quota(1)
        return []

    async def download_captions(self, video_id: str) -> str:
        self._check_quota(50)
        return ""
