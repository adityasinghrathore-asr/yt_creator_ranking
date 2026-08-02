"""
backend/app/services/signal_extractor.py
-----------------------------------------
Orchestrates the five-stage unstructured signal processing pipeline (§2.3).
All thresholds and quality gates come from config.yaml via settings.

Stage 1 — Raw data collection (comments + transcripts)
Stage 2 — Cleaning and normalisation
Stage 3 — Signal extraction (NLP + LLM)
Stage 4 — Score aggregation with recency weighting
Stage 5 — Human-in-the-loop review gates
"""

from app.config import settings
from app.schemas.creator import CreatorProfile


class SignalExtractorService:
    async def process(self, creator: CreatorProfile, brief_id: str) -> dict:
        """
        Run the full pipeline for a single creator.
        Returns a dict of extracted signals ready for the scoring engine.
        STT quality gate uses: settings.llm.stt_min_confidence
                               settings.llm.stt_min_words_per_minute
        HITL routing uses:    settings.brand_safety.sensitivity_levels
                               settings.brand_safety.organic_comment_ratio_min
        """
        if settings.is_synthetic:
            return self._stub_signals(creator)

        # Stage 1
        comments = await self._collect_comments(creator)
        transcript = await self._collect_transcript(creator)

        # Stage 2
        clean_comments = self._clean_comments(comments)
        clean_transcript = self._clean_transcript(transcript)

        # Stage 3
        signals = await self._extract_signals(clean_comments, clean_transcript)

        # Stage 4
        aggregated = self._aggregate_with_recency(signals)

        # Stage 5
        self._check_hitl_gates(aggregated, creator)

        return aggregated

    def _stub_signals(self, creator: CreatorProfile) -> dict:
        return {
            "sentiment_score": 0.72,
            "toxicity_score": 0.05,
            "use_case_alignment": 0.80,
            "style_labels": ["educational", "conversational"],
            "community_values": ["practicality", "trust"],
            "authenticity_extended": 0.75,
            "organic_comment_ratio": 0.92,
        }

    async def _collect_comments(self, creator: CreatorProfile) -> list:
        """
        Target: settings.ingestion.target_comments_total comments
        using mixed sort strategy to reduce selection bias.
        """
        return []

    async def _collect_transcript(self, creator: CreatorProfile) -> str:
        """
        Try captions first. Fall back to STT (Whisper) on up to
        settings.ingestion.stt_fallback_max_videos videos.
        Apply quality gate using settings.llm.stt_min_confidence.
        """
        return ""

    def _clean_comments(self, comments: list) -> list:
        """Strip emoji, detect language, deduplicate, apply bot/coordination filters."""
        return comments

    def _clean_transcript(self, transcript: str) -> str:
        return transcript

    async def _extract_signals(self, comments: list, transcript: str) -> dict:
        return {}

    def _aggregate_with_recency(self, signals: dict) -> dict:
        return signals

    def _check_hitl_gates(self, signals: dict, creator: CreatorProfile):
        """
        Route to human review under conditions defined in §2.3 Stage 5.
        Hard-block check uses settings.brand_safety sensitivity thresholds.
        """
        toxicity = signals.get("toxicity_score", 0)
        sensitivity = settings.sensitivity_config("standard")
        if toxicity >= sensitivity.hard_block:
            # TODO: flag for permanent exclusion
            pass
        elif toxicity >= sensitivity.soft_flag_min:
            # TODO: route to brand safety review queue
            pass
