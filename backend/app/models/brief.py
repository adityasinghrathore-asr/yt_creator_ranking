"""SQLAlchemy model for campaign brief."""

from sqlalchemy import Column, String, Boolean, Integer, JSON
from app.utils.database import Base


class Brief(Base):
    __tablename__ = "briefs"

    brief_id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    campaign_objective = Column(String, nullable=False)
    structured_fields = Column(JSON)
    ai_extracted_signal_set = Column(JSON)      # Before marketer review
    confirmed_signal_set = Column(JSON)         # After marketer confirmation (authoritative)
    confirmed = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    created_at = Column(String)
    updated_at = Column(String)
