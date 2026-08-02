"""
backend/app/schemas/export.py
------------------------------
Schemas for export artefacts and audit log entries.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from app.schemas.score import ShortlistResponse


class ExportMetadata(BaseModel):
    campaign_id: str
    export_timestamp: str
    shortlist_version: int
    scoring_model_version: str


class AuditLogEntry(BaseModel):
    user_id: str
    timestamp: str
    action_type: str     # override | review_decision | creator_added | creator_removed
    detail: Dict[str, Any]


class FullExportPayload(BaseModel):
    metadata: ExportMetadata
    campaign_brief_summary: Dict[str, Any]
    shortlist: ShortlistResponse
    audit_log: List[AuditLogEntry]
