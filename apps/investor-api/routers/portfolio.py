import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import InvestorProfile, DealMatch, Deal, StartupProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
investor_user = require_portal("investor")

STAGE_LABELS = {
    "idea": "Idea", "pre_seed": "Pre-seed", "seed": "Seed",
    "series_a": "Series A", "series_b": "Series B", "growth": "Growth",
}


@router.get("/portfolio")
def get_portfolio(payload: dict = Depends(investor_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]

    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()
    if not profile:
        return {"profile": None, "portfolio": []}

    matches = (
        db.query(DealMatch)
        .join(Deal,           DealMatch.dealId   == Deal.id)
        .join(StartupProfile, Deal.startupId     == StartupProfile.id)
        .filter(DealMatch.investorId == profile.id, DealMatch.status == "closed")
        .order_by(DealMatch.updatedAt.desc())
        .all()
    )

    return {
        "profile": {"firmName": profile.firmName},
        "portfolio": [
            {
                "id":           m.id,
                "companyName":  m.deal.startup.companyName,
                "sector":       m.deal.startup.sector,
                "fundingStage": STAGE_LABELS.get(m.deal.stage, m.deal.stage),
                "targetAmount": m.deal.targetAmount,
                "currency":     m.deal.currency,
                "matchScore":   m.matchScore,
                "updatedAt":    m.updatedAt.isoformat() if m.updatedAt else None,
            }
            for m in matches
        ],
    }
