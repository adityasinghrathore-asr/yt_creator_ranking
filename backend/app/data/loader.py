"""
backend/app/data/loader.py
---------------------------
Reads the synthetic JSON data package at startup and validates against Pydantic schemas.
Only active when settings.is_synthetic is True.
For live mode, the same schemas are populated from the YouTube client.
"""

import json
import logging
from pathlib import Path
from typing import List

from app.schemas.creator import CreatorProfile

logger = logging.getLogger(__name__)

_SYNTHETIC_DIR = Path(__file__).parent / "synthetic"
_CREATOR_CACHE: List[CreatorProfile] = []


async def load_synthetic_data():
    """Load and validate all synthetic creators at startup."""
    global _CREATOR_CACHE
    creators_file = _SYNTHETIC_DIR / "creators.json"

    if not creators_file.exists():
        logger.warning(
            "Synthetic creators.json not found at %s. "
            "Add your creator data file or run scripts/generate_synthetic_data.py",
            creators_file,
        )
        _CREATOR_CACHE = []
        return

    with open(creators_file, "r") as f:
        raw = json.load(f)

    validated = []
    for record in raw:
        try:
            validated.append(CreatorProfile(**record))
        except Exception as e:
            logger.error("Synthetic data validation failed for record %s: %s", record.get("creator_id"), e)

    _CREATOR_CACHE = validated
    logger.info("Loaded %d synthetic creators.", len(_CREATOR_CACHE))


def get_synthetic_creators() -> List[CreatorProfile]:
    return _CREATOR_CACHE
