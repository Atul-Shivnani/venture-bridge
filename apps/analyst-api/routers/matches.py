import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from venturebridge_shared.database import get_db
from venturebridge_shared.models import DealMatch, Deal
from venturebridge_shared.auth import require_portal

logger = logging.getLogger(__name__)

router = APIRouter()
analyst_user = require_portal("analyst")

VALID_DECISIONS = {"approved", "rejected", "pending"}


class MatchDecision(BaseModel):
    status: str
    notes: str = ""


@router.post("/matches/{match_id}/decide")
def decide_match(
    match_id: str,
    body: MatchDecision,
    payload: dict = Depends(analyst_user),
    db: Session = Depends(get_db),
):
    analyst_id = payload["sub"]

    if body.status not in VALID_DECISIONS:
        raise HTTPException(status_code=400, detail=f"status must be one of {VALID_DECISIONS}")

    match = (
        db.query(DealMatch)
        .join(Deal, DealMatch.dealId == Deal.id)
        .filter(DealMatch.id == match_id, Deal.analystId == analyst_id)
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.status = body.status
    db.commit()
    db.refresh(match)

    return {"id": match.id, "status": match.status, "dealId": match.dealId}
