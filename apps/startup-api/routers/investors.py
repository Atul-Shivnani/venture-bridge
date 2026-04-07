import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import StartupProfile, Deal, DealMatch, InvestorProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
startup_user = require_portal("startup")


@router.get("/investors")
def get_investors(payload: dict = Depends(startup_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]

    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        return {"matches": []}

    deals = db.query(Deal).filter(Deal.startupId == profile.id).all()
    deal_map = {d.id: d for d in deals}
    deal_ids = list(deal_map.keys())

    matches = (
        db.query(DealMatch)
        .join(InvestorProfile, DealMatch.investorId == InvestorProfile.id)
        .filter(DealMatch.dealId.in_(deal_ids))
        .order_by(DealMatch.matchScore.desc())
        .all()
    ) if deal_ids else []

    return {
        "matches": [
            {
                "id": m.id,
                "firmName": m.investor.firmName,
                "investorType": m.investor.investorType,
                "ticketSizeLabel": m.investor.ticketSizeLabel,
                "status": m.status,
                "matchScore": m.matchScore,
                "dealTitle": deal_map[m.dealId].title if m.dealId in deal_map else "",
                "dealStage": deal_map[m.dealId].stage if m.dealId in deal_map else "",
            }
            for m in matches
        ]
    }
