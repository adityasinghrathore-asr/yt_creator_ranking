"""SQLAlchemy model for a campaign session."""

from sqlalchemy import Column, String, JSON
from app.utils.database import Base


class CampaignSession(Base):
    __tablename__ = "campaign_sessions"

    session_id = Column(String, primary_key=True)
    brief_id = Column(String, nullable=False)
    user_id = Column(String)
    scoring_run_history = Column(JSON, default=list)
    approved_shortlist_version = Column(String)
    created_at = Column(String)
