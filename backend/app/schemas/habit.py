from uuid import UUID
from pydantic import BaseModel


class HabitItem(BaseModel):
    id:              UUID
    name:            str
    completed_today: bool
    current_streak:  int
    sort_order:      int

    model_config = {"from_attributes": True}


class HabitListResponse(BaseModel):
    habits:        list[HabitItem]
    today_completed: int
    today_total:     int
