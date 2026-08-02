"""
backend/app/clients/jira_client.py
------------------------------------
Wrapper around Jira REST API.
Base URL, project key, and priority thresholds come from settings.services and settings.export.
"""

import logging
from datetime import datetime, timedelta

from app.config import settings

logger = logging.getLogger(__name__)


class JiraClient:
    def __init__(self):
        self.base_url = settings.services.jira_base_url
        self.project_key = settings.services.jira_project_key
        self.api_token = settings.jira_api_token
        self.email = settings.api_keys.jira_email

    def _map_priority(self, campaign_start_date: str | None) -> str:
        """
        Map campaign start date to Jira priority.
        Thresholds: settings.export.jira_priority.urgent_days
                    settings.export.jira_priority.high_days
        """
        if not campaign_start_date:
            return "Medium"
        try:
            start = datetime.fromisoformat(campaign_start_date)
            days_until = (start - datetime.utcnow()).days
            urgent = settings.export.jira_priority.urgent_days
            high = settings.export.jira_priority.high_days
            if days_until <= urgent:
                return "Urgent"
            if days_until <= high:
                return "High"
            return "Medium"
        except ValueError:
            return "Medium"

    async def create_handoff_ticket(
        self,
        shortlist_id: str,
        campaign_name: str = "",
        creator_count: int = 0,
        campaign_start_date: str | None = None,
    ) -> str:
        if not self.api_token:
            logger.info("Jira API token not configured — skipping ticket creation.")
            return "MOCK-001"

        summary = f"[CPI Handoff] {campaign_name} — Shortlist Approved ({creator_count} creators)"
        priority = self._map_priority(campaign_start_date)
        # TODO: implement httpx call to Jira REST API
        logger.info("Jira ticket created: %s (priority: %s)", summary, priority)
        return f"{self.project_key}-001"
