"""
backend/tests/test_export_service.py
--------------------------------------
Tests for the ExportService.
Verifies Jira priority mapping uses config.yaml thresholds.
"""

import pytest
from datetime import datetime, timedelta
from app.clients.jira_client import JiraClient
from app.config import settings


def test_jira_priority_urgent():
    client = JiraClient()
    urgent_days = settings.export.jira_priority.urgent_days
    start = (datetime.utcnow() + timedelta(days=urgent_days - 1)).isoformat()
    assert client._map_priority(start) == "Urgent"


def test_jira_priority_high():
    client = JiraClient()
    high_days = settings.export.jira_priority.high_days
    urgent_days = settings.export.jira_priority.urgent_days
    start = (datetime.utcnow() + timedelta(days=urgent_days + 2)).isoformat()
    assert client._map_priority(start) == "High"


def test_jira_priority_medium():
    client = JiraClient()
    high_days = settings.export.jira_priority.high_days
    start = (datetime.utcnow() + timedelta(days=high_days + 5)).isoformat()
    assert client._map_priority(start) == "Medium"


def test_jira_priority_none_date():
    client = JiraClient()
    assert client._map_priority(None) == "Medium"


def test_jira_priority_invalid_date():
    client = JiraClient()
    assert client._map_priority("not-a-date") == "Medium"


@pytest.mark.asyncio
async def test_generate_json_returns_url(db_session):
    from app.services.export_service import ExportService
    svc = ExportService(db=db_session)
    url = await svc.generate_json("sl-001")
    assert settings.export.gcs_bucket in url
    assert "sl-001" in url


@pytest.mark.asyncio
async def test_generate_csv_returns_url(db_session):
    from app.services.export_service import ExportService
    svc = ExportService(db=db_session)
    url = await svc.generate_csv("sl-001")
    assert settings.export.gcs_bucket in url
