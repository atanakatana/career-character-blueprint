import logging
from fastapi import APIRouter

from app.schemas.trial import TrialReadingRequest, TrialReadingResponse
from app.core.trial_reading import build_trial_reading

router = APIRouter(prefix="/trial", tags=["Trial Reading"])
logger = logging.getLogger(__name__)


@router.post(
    "/reading",
    response_model=TrialReadingResponse,
    summary="Instant free Trial Reading — no payment, no AI call",
)
async def get_trial_reading(data: TrialReadingRequest) -> TrialReadingResponse:
    """
    Returns an instant preview built from static MBTI/Human Design knowledge.
    No submission is created, nothing is persisted — this is a pure, free
    computation so it can run before the user has paid or created an account.
    """
    return build_trial_reading(
        mbti_type=data.mbti_type,
        hd_type=data.hd_type,
        hd_authority=data.hd_authority,
        hd_profile=data.hd_profile,
    )
