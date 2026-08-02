"""
backend/app/workers/celery_app.py
-----------------------------------
Celery application. Redis URL from settings.redis_url.
Worker concurrency from settings.workers.
"""

from celery import Celery
from app.config import settings

celery_app = Celery(
    "cpi",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.workers.tasks.signal_processing",
        "app.workers.tasks.export_generation",
    ],
)

celery_app.conf.update(
    task_soft_time_limit=settings.workers.task_soft_time_limit_seconds,
    task_time_limit=settings.workers.task_hard_time_limit_seconds,
    worker_concurrency=settings.workers.signal_processing_concurrency,
)
