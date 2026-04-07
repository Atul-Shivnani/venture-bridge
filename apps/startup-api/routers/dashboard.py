import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User, StartupProfile, Deal, DealMatch, InvestorProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
startup_user = require_portal("startup")

STAGE_LABELS = {
    "idea": "Idea", "pre_seed": "Pre-seed", "seed": "Seed",
    "series_a": "Series A", "series_b": "Series B", "growth": "Growth",
}

ACTIVE_STATUSES = {"interested", "in_diligence", "term_sheet"}


@router.get("/dashboard")
def get_dashboard(payload: dict = Depends(startup_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]

    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        return {"profile": None, "kpis": {}, "pipeline": [], "topMatches": []}

    deals = (
        db.query(Deal)
        .filter(Deal.startupId == profile.id)
        .all()
    )
    deal_ids = [d.id for d in deals]

    matches = (
        db.query(DealMatch)
        .join(InvestorProfile, DealMatch.investorId == InvestorProfile.id)
        .filter(DealMatch.dealId.in_(deal_ids))
        .all()
    ) if deal_ids else []

    active_investors  = sum(1 for m in matches if m.status in ACTIVE_STATUSES)
    replies_received  = sum(1 for m in matches if m.status != "pending")
    meetings_booked   = sum(1 for m in matches if m.status == "in_diligence")
    warm_intros       = sum(1 for m in matches if m.status == "interested")

    stage_counts: dict[str, int] = {}
    for deal in deals:
        label = STAGE_LABELS.get(deal.stage, deal.stage)
        stage_counts[label] = stage_counts.get(label, 0) + 1
    pipeline = [{"stage": s, "count": c} for s, c in stage_counts.items()]

    top_matches = sorted(matches, key=lambda m: m.matchScore, reverse=True)[:3]
    top_matches_out = [
        {
            "id": m.id,
            "firmName": m.investor.firmName,
            "ticketSizeLabel": m.investor.ticketSizeLabel,
            "investorType": m.investor.investorType,
            "status": m.status,
            "matchScore": m.matchScore,
        }
        for m in top_matches
    ]

    return {
        "profile": {
            "id": profile.id,
            "companyName": profile.companyName,
            "sector": profile.sector,
            "fundingStage": profile.fundingStage,
        },
        "kpis": {
            "activeInvestors": active_investors,
            "repliesReceived": replies_received,
            "meetingsBooked": meetings_booked,
            "warmIntros": warm_intros,
            "totalMatches": len(matches),
        },
        "pipeline": pipeline,
        "topMatches": top_matches_out,
    }
