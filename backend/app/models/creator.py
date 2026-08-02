"""SQLAlchemy model for creator profiles."""

from sqlalchemy import Column, String, Float, Boolean, JSON
from app.utils.database import Base


class Creator(Base):
    __tablename__ = "creators"

    creator_id = Column(String, primary_key=True)
    channel_name = Column(String, nullable=False)
    channel_handle = Column(String)
    thumbnail_url = Column(String)
    metadata_json = Column(JSON)
    metrics_json = Column(JSON)
    content_categories = Column(JSON)
    tier = Column(String)
    data_quality_score = Column(Float, default=1.0)
    transcript_available = Column(Boolean, default=True)
    cold_start = Column(Boolean, default=False)
    last_enriched_at = Column(String)
