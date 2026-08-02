"""backend/app/utils/database.py — Async SQLAlchemy session factory."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    pool_size=settings.infrastructure.db_pool_size,
    max_overflow=settings.infrastructure.db_max_overflow,
    echo=settings.app.debug,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass
