"""
Instant, zero-AI Trial Reading builder.

Deliberately does NOT touch app/ai/* — the paid pipeline's knowledge loader,
prompt builder, and providers are left completely alone. This module reads
the same static JSON files directly (backend/knowledge/) and assembles a
short, free preview the moment the assessment is submitted.
"""
import json
import logging
from pathlib import Path

from app.schemas.trial import TrialReadingResponse

logger = logging.getLogger(__name__)

_KNOWLEDGE_BASE = Path(__file__).parent.parent.parent / "knowledge"

_FALLBACK_ARCHETYPE = "The Seeker"


def _load(folder: str, filename: str) -> dict | None:
    path = _KNOWLEDGE_BASE / folder / f"{filename}.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        logger.warning(f"[trial_reading] Knowledge file not found: {path}")
        return None
    except Exception as exc:
        logger.error(f"[trial_reading] Error loading {path}: {exc}")
        return None


def build_trial_reading(
    mbti_type:    str,
    hd_type:      str,
    hd_authority: str,
    hd_profile:   str,
) -> TrialReadingResponse:
    mbti = _load("mbti", mbti_type.upper()) if mbti_type and mbti_type != "UNKNOWN" else None
    hd   = _load("hd_types", hd_type.replace(" ", "_")) if hd_type and hd_type != "UNKNOWN" else None

    archetype = mbti.get("name", _FALLBACK_ARCHETYPE) if mbti else _FALLBACK_ARCHETYPE

    personality_summary = (
        mbti.get("work_style")
        if mbti and mbti.get("work_style")
        else "Your personality profile is still coming into focus — the full "
             "Blueprint synthesises this in depth."
    )

    core_strengths = (mbti.get("strengths") or [])[:4] if mbti else [
        "Adaptability", "Curiosity", "Follow-through",
    ]

    if hd:
        energy_type = f"{hd.get('type', hd_type)} — {hd.get('energy', '')}".strip(" —")
    else:
        energy_type = "Energy profile pending — complete Human Design details for full accuracy."

    career_domains = (mbti.get("career_domains") or [])[:3] if mbti else []
    basic_career_recommendation = (
        "Arenas worth exploring: " + ", ".join(career_domains) + "."
        if career_domains
        else "Your top career arenas are unlocked in the full Blueprint."
    )

    return TrialReadingResponse(
        character_archetype=archetype,
        personality_summary=personality_summary,
        core_strengths=core_strengths,
        energy_type=energy_type,
        basic_career_recommendation=basic_career_recommendation,
        mbti_type=mbti_type,
    )
