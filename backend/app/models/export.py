"""SQLAlchemy model for export records."""

from sqlalchemy import Column, String, Boolean
from app.utils.database import Base


class ExportRecord(Base):
    __tablename__ = "export_records"

    export_id = Column(String, primary_key=True)
    shortlist_id = Column(String, nullable=False)
    export_type = Column(String)     # json | csv | pdf
    shortlist_version = Column(String)
    exporting_user_id = Column(String)
    gcs_url = Column(String)
    locked = Column(Boolean, default=False)   # immutable once True
    exported_at = Column(String)
