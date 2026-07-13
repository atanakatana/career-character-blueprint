from pydantic import BaseModel, Field
from typing import Optional


# ── v3 sub-schemas ─────────────────────────────────────────────────────────

class ProfileLine(BaseModel):
    """One line from the person's Human Design profile (e.g. Line 3 / Martyr)."""
    line_name:   str            = Field(..., min_length=1)   # "LINE 3 // MARTYR"
    title:       str            = Field(..., min_length=1)   # "LEARN THROUGH TRIAL AND ERROR"
    body:        str            = Field(..., min_length=20)
    implication: Optional[str]  = None                       # optional practical note


class BlindSpot(BaseModel):
    """
    Shadow stat in MECHANISM + SCENARIO format.
    Exactly three per reading — product rule.
    """
    name:      str = Field(..., min_length=3)   # "IDEA BURNOUT"
    mechanism: str = Field(..., min_length=20)  # what triggers it
    scenario:  str = Field(..., min_length=20)  # concrete workplace scenario


class CareerArena(BaseModel):
    """
    Career path recommendation.
    No income/salary figures — product rule.
    Existing skills must reflect the person's actual background.
    """
    career_name:        str       = Field(..., min_length=1)
    career_subtitle:    str       = Field(default="")          # "(FREELANCE / ENTRY-LEVEL)"
    why_it_fits:        str       = Field(..., min_length=20)
    existing_skills:    list[str] = Field(..., min_length=2, max_length=5)
    skills_to_develop:  list[str] = Field(..., min_length=2, max_length=5)
    is_best_fit:        bool      = False                      # exactly one True per reading
    first_action:       str       = Field(..., min_length=10)


class DailyQuest(BaseModel):
    """Immediately actionable quest — doable tomorrow, not abstract."""
    name:          str = Field(..., min_length=2)
    description:   str = Field(..., min_length=20)
    time_estimate: str = Field(..., min_length=2)   # "20 MINUTES"


# ── v3 main schema ─────────────────────────────────────────────────────────

class AIOutput(BaseModel):
    """
    v3 schema — 7-section Career Blueprint structure matching the product standard.

    Sections:
      I   Character Data        → character_title, character_tagline,
                                  character_domain, system_message
      II  Internal Conflict     → conflict_mechanism, conflict_result
                                  (VS battle items are computed on the frontend)
      III Profile Line Analysis → profile_intro, profile_lines, profile_synthesis
      IV  Blind Spots           → blind_spots (MECHANISM + SCENARIO × 3)
      V   Career Arenas         → career_arenas
      VI  Decision Protocol     → decision_* fields
      VII Daily Quests          → daily_quests
          Closing               → closing_statement

    character_title is stored as a separate DB column.
    Everything else is stored in report_data JSONB.
    Presence of 'system_message' in report_data identifies a v3 report.
    """

    # ── Cover / hero ──────────────────────────────────────────────────────
    character_title:   str = Field(..., min_length=1, max_length=255)
    character_tagline: str = Field(..., min_length=10)

    # ── Section I: Character Data ─────────────────────────────────────────
    character_domain:  str = Field(..., min_length=5)
    system_message:    str = Field(..., min_length=20)  # ← v3 marker field

    # ── Section II: Internal Conflict ─────────────────────────────────────
    # VS battle items (left/right columns) are computed on the frontend.
    # AI generates the surrounding analysis.
    conflict_mechanism: str = Field(..., min_length=30)
    conflict_result:    str = Field(..., min_length=30)

    # ── Section III: Profile Line Analysis ───────────────────────────────
    profile_intro:     str              = Field(..., min_length=20)
    profile_lines:     list[ProfileLine] = Field(..., min_length=2, max_length=2)
    profile_synthesis: str              = Field(..., min_length=20)

    # ── Section IV: Blind Spots ───────────────────────────────────────────
    blind_spots: list[BlindSpot] = Field(..., min_length=3, max_length=3)

    # ── Section V: Career Arenas ──────────────────────────────────────────
    career_arenas: list[CareerArena] = Field(..., min_length=2, max_length=5)

    # ── Section VI: Decision Protocol ────────────────────────────────────
    decision_intro:       str = Field(..., min_length=20)
    decision_question:    str = Field(..., min_length=10)
    decision_yes_signal:  str = Field(..., min_length=5)
    decision_no_signal:   str = Field(..., min_length=5)
    decision_trap_name:   str = Field(..., min_length=3)
    decision_trap_body:   str = Field(..., min_length=20)

    # ── Section VII: Daily Quests ─────────────────────────────────────────
    daily_quests: list[DailyQuest] = Field(..., min_length=3, max_length=5)

    # ── Closing ───────────────────────────────────────────────────────────
    closing_statement: str = Field(..., min_length=20)

    def to_report_data(self) -> dict:
        """Returns the JSONB-storable dict, excluding character_title."""
        data = self.model_dump()
        data.pop("character_title", None)
        return data
