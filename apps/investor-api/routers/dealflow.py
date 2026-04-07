import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import InvestorProfile, DealMatch, Deal, StartupProfile, TermSheet
from venturebridge_shared.auth import require_portal

router = APIRouter()
investor_user = require_portal("investor")

STATUS_ORDER  = ["pending", "interested", "in_diligence", "term_sheet", "closed", "passed"]
STATUS_LABELS = {
    "pending":      "New Match",
    "interested":   "Interested",
    "passed":       "Passed",
    "in_diligence": "In Diligence",
    "term_sheet":   "Term Sheet",
    "closed":       "Closed",
}
STAGE_LABELS = {
    "idea": "Idea", "pre_seed": "Pre-seed", "seed": "Seed",
    "series_a": "Series A", "series_b": "Series B", "growth": "Growth",
}


from typing import Optional

@router.get("/dealflow")
def get_dealflow(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    payload: dict = Depends(investor_user),
    db: Session = Depends(get_db)
):
    user_id = payload["sub"]

    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()
    if not profile:
        return {"profile": None, "groups": {s: [] for s in STATUS_ORDER}, "pagination": {"skip": skip, "limit": limit, "total": 0}}

    query = (
        db.query(DealMatch)
        .join(Deal,          DealMatch.dealId  == Deal.id)
        .join(StartupProfile, Deal.startupId   == StartupProfile.id)
        .filter(DealMatch.investorId == profile.id)
    )

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (StartupProfile.companyName.ilike(search_term)) |
            (Deal.title.ilike(search_term))
        )

    total = query.count()
    matches = query.order_by(DealMatch.updatedAt.desc()).offset(skip).limit(limit).all()

    groups: dict[str, list] = {s: [] for s in STATUS_ORDER}
    for m in matches:
        ts = m.termSheet
        groups.setdefault(m.status, []).append({
            "id":          m.id,
            "companyName": m.deal.startup.companyName,
            "sector":      m.deal.startup.sector,
            "stage":       STAGE_LABELS.get(m.deal.stage, m.deal.stage),
            "targetAmount": m.deal.targetAmount,
            "currency":    m.deal.currency,
            "status":      m.status,
            "matchScore":  m.matchScore,
            "termSheet": {
                "id":             ts.id,
                "proposedAmount": ts.proposedAmount,
                "valuation":      ts.valuation,
                "terms":          ts.terms,
                "status":         ts.status,
            } if ts else None,
        })

    return {
        "profile": {"firmName": profile.firmName},
        "groups":  groups,
        "pagination": {
            "skip": skip,
            "limit": limit,
            "total": total,
        }
    }


ALLOWED_MATCH_STATUSES = {"pending", "interested", "passed", "in_diligence", "term_sheet", "closed"}


class MatchStatusUpdate(BaseModel):
    status: str


@router.put("/dealflow/{match_id}")
def update_match_status(
    match_id: str,
    body: MatchStatusUpdate,
    payload: dict = Depends(investor_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found")

    match = db.query(DealMatch).filter(
        DealMatch.id == match_id,
        DealMatch.investorId == profile.id,
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Deal match not found")

    if body.status not in ALLOWED_MATCH_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(ALLOWED_MATCH_STATUSES)}")

    match.status = body.status
    match.updatedAt = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "status": match.status}
