"""
backend/app/workers/tasks/export_generation.py
------------------------------------------------
Celery task for PDF export generation via headless Chrome.
"""

import logging
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="export_generation.generate_pdf")
def generate_pdf_export(shortlist_id: str):
    """Render HTML brief template via headless Chrome and upload to GCS."""
    logger.info("Generating PDF export for shortlist=%s", shortlist_id)
    # TODO: implement headless Chrome PDF generation
