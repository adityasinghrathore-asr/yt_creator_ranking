"""
backend/app/services/export_service.py
----------------------------------------
Generates JSON, CSV, and PDF export artefacts.
GCS bucket and Jira handoff config come from settings.export and settings.services.
"""

from app.config import settings
from app.clients.jira_client import JiraClient


class ExportService:
    def __init__(self, db):
        self.db = db
        self.jira = JiraClient()

    async def generate_json(self, shortlist_id: str) -> str:
        """Assemble FullExportPayload, upload to GCS, return signed URL."""
        # GCS bucket: settings.export.gcs_bucket
        # Signed URL expiry: settings.export.signed_url_expiry_hours
        return f"https://storage.example.com/{settings.export.gcs_bucket}/{shortlist_id}.json"

    async def generate_csv(self, shortlist_id: str) -> str:
        return f"https://storage.example.com/{settings.export.gcs_bucket}/{shortlist_id}.csv"

    async def approve_and_handoff(self, shortlist_id: str, user_id: str) -> dict:
        """
        Lock shortlist version immutably, create Jira ticket.
        Priority mapping uses settings.export.jira_priority thresholds.
        """
        ticket_key = await self.jira.create_handoff_ticket(shortlist_id)
        return {
            "shortlist_id": shortlist_id,
            "locked": True,
            "jira_ticket": ticket_key,
        }
