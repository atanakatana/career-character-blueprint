from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, Field


# ─── REQUESTS ────────────────────────────────────────────────────────────────
class SetGoalRequest(BaseModel):
    target_job: str = Field(..., min_length=1, max_length=150)

    model_config = {"str_strip_whitespace": True}


class GenerateQuestsRequest(BaseModel):
    reading: str = Field(..., min_length=30, max_length=4000)
    goal:    str = Field(..., min_length=1, max_length=150)

    model_config = {"str_strip_whitespace": True}


# ─── RESPONSES ───────────────────────────────────────────────────────────────
class QuestItem(BaseModel):
    id:            UUID
    title:         str
    description:   str
    time_estimate: str | None
    xp_reward:     int
    status:        str   # active | completed
    source:        str   # example | generated
    completed_at:  datetime | None

    model_config = {"from_attributes": True}


class TrackerState(BaseModel):
    id:                   UUID
    target_job:           str | None
    xp:                   int
    level:                int
    current_streak:       int
    longest_streak:       int
    last_completed_date:  date | None
    quests:               list[QuestItem]

    model_config = {"from_attributes": True}


class CompleteQuestResponse(BaseModel):
    tracker:    TrackerState
    xp_gained:  int
    leveled_up: bool
