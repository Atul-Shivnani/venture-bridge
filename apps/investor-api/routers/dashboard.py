import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User, InvestorProfile, DealMatch, Deal, StartupProfile, DiligenceItem
from venturebridge_shared.auth import require_portal

router = APIRouter()
investor_user = require_portal("investor")

STATUS_LABELS = {
    "pending":      "New",
    "interested":   "Interested",
    "passed":       "Passed",
    "in_diligence": "In Diligence",
    "term_sheet":   "Term Sheet",
    "closed":       "Closed",
}


@router.get("/dashboard")
def get_dashboard(payload: dict = Depends(investor_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]

    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()
    if not profile:
        return {"profile": None, "kpis": {}, "dealflow": [], "topMatches": [], "diligenceItems": []}

    matches = (
        db.query(DealMatch)
        .join(Deal,          DealMatch.dealId     == Deal.id)
        .join(StartupProfile, Deal.startupId      == StartupProfile.id)
        .filter(DealMatch.investorId == profile.id)
        .order_by(DealMatch.updatedAt.desc())
        .all()
    )

    diligence_items = (
        db.query(DiligenceItem)
        .join(Deal,          DiligenceItem.dealId  == Deal.id)
        .join(StartupProfile, Deal.startupId       == StartupProfile.id)
        .filter(
            DiligenceItem.investorId == profile.id,
            DiligenceItem.status     != "complete",
        )
        .order_by(DiligenceItem.createdAt.desc())
        .limit(5)
        .all()
    )

    stage_counts: dict[str, int] = {}
    for m in matches:
        label = STATUS_LABELS.get(m.status, m.status)
        stage_counts[label] = stage_counts.get(label, 0) + 1
    dealflow = [{"stage": s, "count": c} for s, c in stage_counts.items()]

    top_matches = sorted(
        [m for m in matches if m.status not in ("passed", "closed")],
        key=lambda m: m.matchScore,
        reverse=True,
    )[:3]

    return {
        "profile": {"id": profile.id, "firmName": profile.firmName},
        "kpis": {
            "totalMatches":   len(matches),
            "partnerCalls":   sum(1 for m in matches if m.status == "in_diligence"),
            "liveDiligences": len(diligence_items),
            "warmIntros":     sum(1 for m in matches if m.status == "interested"),
            "termSheets":     sum(1 for m in matches if m.status == "term_sheet"),
        },
        "dealflow": dealflow,
        "topMatches": [
            {
                "id":          m.id,
                "companyName": m.deal.startup.companyName,
                "sector":      m.deal.startup.sector,
                "status":      m.status,
                "matchScore":  m.matchScore,
            }
            for m in top_matches
        ],
        "diligenceItems": [
            {
                "id":          d.id,
                "title":       d.title,
                "category":    d.category,
                "status":      d.status,
                "companyName": d.deal.startup.companyName,
                "assignedTo":  d.assignedTo.email if d.assignedTo else None,
            }
            for d in diligence_items
        ],
    }
