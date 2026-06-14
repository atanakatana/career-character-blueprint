from celery import Celery
from app.config import settings


celery_app = Celery(
    "ccblueprint",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    # Tasks registered here; Sprint 5 will add generation and email tasks
    include=["app.tasks"],
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    # Timezone
    timezone="UTC",
    enable_utc=True,
    # Reliability
    task_track_started=True,
    task_acks_late=True,        # Ack only after task completes (no lost tasks on worker crash)
    worker_prefetch_multiplier=1,  # One task at a time per worker slot (AI tasks are slow)
    # Result TTL
    result_expires=60 * 60 * 24,  # 24 hours
    # Retry defaults
    task_max_retries=2,
    task_default_retry_delay=30,  # seconds
)
