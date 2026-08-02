"""
backend/app/workers/tasks/signal_processing.py
------------------------------------------------
Celery task for the asynchronous unstructured signal processing pipeline.
"""

import logging
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="signal_processing.process_creator")
def process_creator_signals(creator_id: str, brief_id: str):
    """
    Run the five-stage NLP pipeline for a single creator.
    Results are written back to the creator's score record in the DB.
    HITL gates fire Jira review tasks when triggered.
    """
    logger.info("Processing signals for creator=%s brief=%s", creator_id, brief_id)
    # TODO: import and call SignalExtractorService synchronously within Celery context
