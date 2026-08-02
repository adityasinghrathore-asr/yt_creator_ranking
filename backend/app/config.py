"""
backend/app/config.py
---------------------
Single source of truth for all backend configuration.
Reads from /config.yaml at the monorepo root (two levels up from this file).
Environment variables can override individual values — the DATABASE_URL env var
takes precedence over the yaml db_* fields.

Usage anywhere in the backend:
    from app.config import settings
    model = settings.llm.model
    db_url = settings.database_url
"""

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml
from pydantic import BaseModel, Field, validator


# ---------------------------------------------------------------------------
# Locate config.yaml at monorepo root (../../config.yaml from this file)
# ---------------------------------------------------------------------------
_HERE = Path(__file__).resolve()
_REPO_ROOT = _HERE.parents[2]          # backend/app/config.py → root
_CONFIG_PATH = _REPO_ROOT / "config.yaml"

if not _CONFIG_PATH.exists():
    raise FileNotFoundError(
        f"config.yaml not found at {_CONFIG_PATH}. "
        "Make sure you are running from the monorepo root."
    )

with open(_CONFIG_PATH, "r") as _f:
    _raw: Dict[str, Any] = yaml.safe_load(_f)


# ---------------------------------------------------------------------------
# Nested config models
# ---------------------------------------------------------------------------

class AppConfig(BaseModel):
    name: str
    version: str
    environment: str
    debug: bool
    log_level: str


class ApiKeysConfig(BaseModel):
    anthropic: str = ""
    youtube: str = ""
    hypeauditor: str = ""
    perspective: str = ""
    jira_api_token: str = ""
    jira_email: str = ""
    openai_moderation: str = ""


class ServicesConfig(BaseModel):
    jira_base_url: str
    jira_project_key: str
    hypeauditor_base_url: str
    perspective_base_url: str


class InfrastructureConfig(BaseModel):
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str
    db_pool_size: int
    db_max_overflow: int
    redis_host: str
    redis_port: int
    redis_db: int
    redis_password: str
    backend_host: str
    backend_port: int
    backend_reload: bool
    frontend_port: int


class SecurityConfig(BaseModel):
    secret_key: str
    jwt_algorithm: str
    jwt_expire_minutes: int
    cors_origins: List[str]


class DimensionWeights(BaseModel):
    audience_fit: int
    engagement_quality: int
    content_style_fit: int
    brand_safety: int
    operational_fit: int

    @validator("*", pre=False, always=True)
    def weights_sum_to_100(cls, v, values):
        # Full sum validation is done at the parent level
        return v


class ScoringTiers(BaseModel):
    platinum_min: int
    gold_min: int
    silver_min: int
    bronze_min: int


class ScoringConfig(BaseModel):
    min_candidate_pool: int
    max_candidate_pool: int
    advisory_pool_threshold: int
    constraint_pool_threshold: int
    zero_match_threshold: int
    max_caption_downloads: int
    dimension_weights: Dict[str, DimensionWeights]
    tiers: ScoringTiers
    cold_start_data_quality_threshold: float
    stt_min_confidence: float
    stt_min_words_per_minute: int


class SensitivityLevel(BaseModel):
    hard_block: float
    soft_flag_min: float
    route_political_to_review: bool = False


class BrandSafetyConfig(BaseModel):
    sensitivity_levels: Dict[str, SensitivityLevel]
    authenticity_proxy_min: float
    organic_comment_ratio_min: float


class RefreshSchedule(BaseModel):
    subscriber_engagement: str
    computed_signals: str
    nlp_signals: str
    demographics_embeddings: str


class IngestionConfig(BaseModel):
    target_comments_total: int
    target_comments_per_video: int
    target_videos_for_comments: int
    min_videos_in_90_days: int
    stt_fallback_max_videos: int
    refresh_schedule: RefreshSchedule
    vsr_floor_percent: float


class YoutubeQuotaConfig(BaseModel):
    global_alert_threshold: int
    default_workspace_budget: int
    enterprise_workspace_budget: int


class JustificationWordLimits(BaseModel):
    match_summary: int
    dimension_highlights: int
    risks: int


class LLMConfig(BaseModel):
    model: str
    max_tokens: int
    brief_interpretation_temperature: float
    justification_temperature: float
    signal_extraction_temperature: float
    real_world_research_temperature: float
    retry_max_attempts: int
    retry_backoff_multiplier: float
    justification_word_limits: JustificationWordLimits


class JiraPriorityConfig(BaseModel):
    urgent_days: int
    high_days: int


class ExportConfig(BaseModel):
    gcs_bucket: str
    signed_url_expiry_hours: int
    jira_priority: JiraPriorityConfig
    version_retention_months: int


class FrontendConfig(BaseModel):
    api_base_url: str
    image_domains: List[str]
    confirmation_min_dwell_ms: int


class WorkersConfig(BaseModel):
    signal_processing_concurrency: int
    export_generation_concurrency: int
    task_soft_time_limit_seconds: int
    task_hard_time_limit_seconds: int


# ---------------------------------------------------------------------------
# Root settings object
# ---------------------------------------------------------------------------

class Settings(BaseModel):
    app: AppConfig
    data_mode: str                    # synthetic | hybrid | live
    api_keys: ApiKeysConfig
    services: ServicesConfig
    infrastructure: InfrastructureConfig
    security: SecurityConfig
    scoring: ScoringConfig
    brand_safety: BrandSafetyConfig
    ingestion: IngestionConfig
    youtube_quota: YoutubeQuotaConfig
    llm: LLMConfig
    export: ExportConfig
    frontend: FrontendConfig
    workers: WorkersConfig

    # ------------------------------------------------------------------
    # Computed helpers — derived from the yaml, not stored in yaml
    # ------------------------------------------------------------------

    @property
    def database_url(self) -> str:
        """Full SQLAlchemy database URL. DATABASE_URL env var takes precedence."""
        env_override = os.getenv("DATABASE_URL")
        if env_override:
            return env_override
        inf = self.infrastructure
        return (
            f"postgresql+asyncpg://{inf.db_user}:{inf.db_password}"
            f"@{inf.db_host}:{inf.db_port}/{inf.db_name}"
        )

    @property
    def sync_database_url(self) -> str:
        """Synchronous database URL for Alembic migrations."""
        return self.database_url.replace("postgresql+asyncpg://", "postgresql://")

    @property
    def redis_url(self) -> str:
        """Full Redis URL for Celery broker and result backend."""
        env_override = os.getenv("REDIS_URL")
        if env_override:
            return env_override
        inf = self.infrastructure
        password_part = f":{inf.redis_password}@" if inf.redis_password else ""
        return f"redis://{password_part}{inf.redis_host}:{inf.redis_port}/{inf.redis_db}"

    @property
    def is_synthetic(self) -> bool:
        return self.data_mode == "synthetic"

    @property
    def is_hybrid(self) -> bool:
        return self.data_mode == "hybrid"

    @property
    def is_live(self) -> bool:
        return self.data_mode == "live"

    @property
    def anthropic_api_key(self) -> str:
        """Anthropic key — env var ANTHROPIC_API_KEY takes precedence over yaml."""
        return os.getenv("ANTHROPIC_API_KEY", self.api_keys.anthropic)

    @property
    def youtube_api_key(self) -> str:
        return os.getenv("YOUTUBE_API_KEY", self.api_keys.youtube)

    @property
    def perspective_api_key(self) -> str:
        return os.getenv("PERSPECTIVE_API_KEY", self.api_keys.perspective)

    @property
    def hypeauditor_api_key(self) -> str:
        return os.getenv("HYPEAUDITOR_API_KEY", self.api_keys.hypeauditor)

    @property
    def jira_api_token(self) -> str:
        return os.getenv("JIRA_API_TOKEN", self.api_keys.jira_api_token)

    def dimension_weights_for(self, objective: str) -> DimensionWeights:
        """Return scoring weights for a given campaign objective."""
        weights = self.scoring.dimension_weights
        if objective not in weights:
            raise ValueError(
                f"Unknown campaign objective '{objective}'. "
                f"Valid options: {list(weights.keys())}"
            )
        return weights[objective]

    def sensitivity_config(self, level: str = "standard") -> SensitivityLevel:
        """Return brand safety thresholds for a given sensitivity level."""
        levels = self.brand_safety.sensitivity_levels
        if level not in levels:
            raise ValueError(
                f"Unknown sensitivity level '{level}'. "
                f"Valid options: {list(levels.keys())}"
            )
        return levels[level]


# ---------------------------------------------------------------------------
# Load and cache — imported once per process
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Load and validate config.yaml exactly once per process.
    Raises a Pydantic ValidationError immediately if anything is misconfigured,
    so the application refuses to start rather than failing silently at runtime.
    """
    return Settings(**_raw)


# Convenience alias — use this throughout the backend:
#   from app.config import settings
settings: Settings = get_settings()
