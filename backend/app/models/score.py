"""SQLAlchemy model for a scored creator within a campaign run."""

from sqlalchemy import Column, String, Float, Integer, JSON
from app.utils.database import Base


class Score(Base):
    __tablename__ = "scores"

    score_id = Column(String, primary_key=True)
    brief_id = Column(String, nullable=False)
    creator_id = Column(String, nullable=False)
    shortlist_id = Column(String)
    rank = Column(Integer)
    ccms = Column(Float)
    partnership_tier = Column(String)
    dimension_scores = Column(JSON)
    justification = Column(JSON)
    hitl_status = Column(String, default="cleared")
    override_history = Column(JSON, default=list)   # appended, never replaced
    data_quality_score = Column(Float, default=1.0)
    created_at = Column(String)
