import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import StartupProfile, Deal, DealMatch, InvestorProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
startup_user = require_portal("startup")

STATUS_ORDER = ["pending", "interested", "in_diligence", "term_sheet", "closed", "passed"]


@router.get("/pipeline")
def get_pipeline(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    payload: dict = Depends(startup_user),
    db: Session = Depends(get_db)
):
    user_id = payload["sub"]

    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        return {"profile": None, "groups": {s: [] for s in STATUS_ORDER}, "pagination": {"skip": skip, "limit": limit, "total": 0}}

    deals = db.query(Deal).filter(Deal.startupId == profile.id).all()
    deal_map = {d.id: d for d in deals}
    deal_ids = list(deal_map.keys())

    if not deal_ids:
        return {"profile": {"companyName": profile.companyName}, "groups": {s: [] for s in STATUS_ORDER}, "pagination": {"skip": skip, "limit": limit, "total": 0}}

    query = (
        db.query(DealMatch)
        .join(InvestorProfile, DealMatch.investorId == InvestorProfile.id)
        .filter(DealMatch.dealId.in_(deal_ids))
    )

    if search:
        search_term = f"%{search}%"
        query = query.filter(InvestorProfile.firmName.ilike(search_term))

    total = query.count()
    matches = query.order_by(DealMatch.matchScore.desc()).offset(skip).limit(limit).all()

    groups: dict[str, list] = {s: [] for s in STATUS_ORDER}
    for m in matches:
        deal = deal_map.get(m.dealId)
        entry = {
            "id": m.id,
            "firmName": m.investor.firmName,
            "ticketSizeLabel": m.investor.ticketSizeLabel,
            "investorType": m.investor.investorType,
            "matchScore": m.matchScore,
            "status": m.status,
            "dealTitle": deal.title if deal else "",
            "dealStage": deal.stage if deal else "",
        }
        groups.setdefault(m.status, []).append(entry)

    return {
        "profile": {"companyName": profile.companyName},
        "groups": groups,
        "pagination": {
            "skip": skip,
            "limit": limit,
            "total": total,
        }
    }


class DealCreate(BaseModel):
    title: str
    stage: str
    targetAmount: float
    currency: Optional[str] = "USD"


ALLOWED_STAGES = {"idea", "pre_seed", "seed", "series_a", "series_b", "growth"}


@router.post("/pipeline")
def create_deal(
    body: DealCreate,
    payload: dict = Depends(startup_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    if body.stage not in ALLOWED_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {', '.join(ALLOWED_STAGES)}")

    if body.targetAmount <= 0:
        raise HTTPException(status_code=400, detail="Target amount must be positive")

    now = datetime.now(timezone.utc)
    deal = Deal(
        id=str(uuid.uuid4()),
        startupId=profile.id,
        title=body.title,
        stage=body.stage,
        targetAmount=body.targetAmount,
        currency=body.currency or "USD",
        status="draft",
        createdAt=now,
        updatedAt=now,
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)

    return {
        "success": True,
        "deal": {
            "id":           deal.id,
            "title":        deal.title,
            "stage":        deal.stage,
            "targetAmount": deal.targetAmount,
            "currency":     deal.currency,
            "status":       deal.status,
        },
    }

