from app.schemas.report import BlueprintReportResponse
from pydantic import BaseModel


class MyBlueprintResponse(BaseModel):
    """
    Response for GET /api/users/me/blueprint.

    `unlocked=False` covers two states the dashboard needs to distinguish
    between: no paid submission yet, or one still processing. `status`
    carries which (see api/routes/users.py) so the frontend can show the
    right CTA ("Unlock" vs "Still crafting your Blueprint...").
    """
    unlocked: bool
    status:   str  # "none" | "pending" | "processing" | "failed" | "completed"
    report:   BlueprintReportResponse | None = None
    token:    str | None = None  # lets the dashboard deep-link to /blueprint/{token}
