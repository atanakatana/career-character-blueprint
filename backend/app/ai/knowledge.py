import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Base path is always relative to this file → backend/knowledge/
_KNOWLEDGE_BASE = Path(__file__).parent.parent.parent / "knowledge"


class KnowledgeLoader:
    """
    Loads MBTI and Human Design knowledge JSON files and converts them to
    compact context strings for injection into the AI prompt.

    Files are JSON; the formatted output is readable text optimised for
    token efficiency and AI comprehension.
    """

    def __init__(self, base: Path = _KNOWLEDGE_BASE):
        self.base = base

    # ── Public API ─────────────────────────────────────────────────────────────

    def load_context(
        self,
        mbti_type:    str,
        hd_type:      str,
        hd_authority: str,
        hd_profile:   str,
    ) -> dict[str, str]:
        return {
            "mbti":         self._mbti(mbti_type),
            "hd_type":      self._hd_type(hd_type),
            "hd_authority": self._hd_authority(hd_authority),
            "hd_profile":   self._hd_profile(hd_profile),
        }

    # ── Private loaders ────────────────────────────────────────────────────────

    def _mbti(self, code: str) -> str:
        if not code or code.upper() == "UNKNOWN":
            return "MBTI type not provided. Rely on Human Design and career context only."
        data = self._load("mbti", code.upper())
        if not data:
            return f"MBTI type: {code} (detailed knowledge unavailable)."
        return self._fmt_mbti(data)

    def _hd_type(self, hd_type: str) -> str:
        if not hd_type or hd_type == "UNKNOWN":
            return "Human Design type not provided."
        filename = hd_type.replace(" ", "_")
        data = self._load("hd_types", filename)
        if not data:
            return f"HD Type: {hd_type} (detailed knowledge unavailable)."
        return self._fmt_hd_type(data)

    def _hd_authority(self, authority: str) -> str:
        if not authority or authority == "UNKNOWN":
            return "Human Design authority not provided."
        # "Emotional / Solar Plexus" → "Emotional_Solar_Plexus"
        filename = authority.replace("/", "").replace("  ", "_").replace(" ", "_")
        data = self._load("hd_authorities", filename)
        if not data:
            return f"HD Authority: {authority} (detailed knowledge unavailable)."
        return self._fmt_hd_authority(data)

    def _hd_profile(self, profile: str) -> str:
        if not profile or profile == "UNKNOWN":
            return "Human Design profile not provided."
        # "3/5 — Martyr / Heretic"  → "3_5"
        code = profile.split("—")[0].strip().replace("/", "_")
        data = self._load("hd_profiles", code)
        if not data:
            return f"HD Profile: {profile} (detailed knowledge unavailable)."
        return self._fmt_hd_profile(data)

    # ── File I/O ───────────────────────────────────────────────────────────────

    def _load(self, folder: str, filename: str) -> dict | None:
        path = self.base / folder / f"{filename}.json"
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            logger.warning(f"Knowledge file not found: {path}")
            return None
        except Exception as exc:
            logger.error(f"Error loading {path}: {exc}")
            return None

    # ── Formatters — compact text for prompt injection ─────────────────────────

    @staticmethod
    def _fmt_mbti(d: dict) -> str:
        lines = [
            f"{d.get('type')} — {d.get('name')}",
            f"Work Style: {d.get('work_style', '')}",
            f"Strengths: {', '.join(d.get('strengths', []))}",
            f"Energy Drains: {', '.join(d.get('energy_drains', []))}",
            f"Environment Needs: {', '.join(d.get('environment_needs', []))}",
            f"Career Domains: {', '.join(d.get('career_domains', []))}",
            f"Decision Making: {d.get('decision_making', '')}",
            f"Leadership Style: {d.get('leadership_style', '')}",
            f"Growth Edges: {', '.join(d.get('growth_edges', []))}",
        ]
        return "\n".join(l for l in lines if l.split(": ", 1)[-1])

    @staticmethod
    def _fmt_hd_type(d: dict) -> str:
        lines = [
            f"{d.get('type')} — Strategy: {d.get('strategy')}",
            f"Energy: {d.get('energy', '')}",
            f"Work Approach: {d.get('work_approach', '')}",
            f"Career Advice: {d.get('career_advice', '')}",
            f"Burnout Signal: {d.get('burnout_signal', '')}",
            f"Strengths: {', '.join(d.get('strengths', []))}",
            f"Key Pitfall: {d.get('pitfall', '')}",
        ]
        return "\n".join(l for l in lines if l.split(": ", 1)[-1])

    @staticmethod
    def _fmt_hd_authority(d: dict) -> str:
        lines = [
            f"Authority: {d.get('authority')}",
            f"Decision Style: {d.get('decision_style', '')}",
            f"Time to Decide: {d.get('time_to_decide', '')}",
            f"Career Application: {d.get('career_application', '')}",
            f"Common Mistake: {d.get('common_mistake', '')}",
        ]
        return "\n".join(l for l in lines if l.split(": ", 1)[-1])

    @staticmethod
    def _fmt_hd_profile(d: dict) -> str:
        lines = [
            f"Profile {d.get('profile')} — {d.get('name')}",
            f"Life Theme: {d.get('life_theme', '')}",
            f"Work Pattern: {d.get('work_pattern', '')}",
            f"Career Approach: {d.get('career_approach', '')}",
            f"Strengths: {', '.join(d.get('strengths', []))}",
            f"Growth Edge: {d.get('growth_edge', '')}",
        ]
        return "\n".join(l for l in lines if l.split(": ", 1)[-1])


knowledge_loader = KnowledgeLoader()
