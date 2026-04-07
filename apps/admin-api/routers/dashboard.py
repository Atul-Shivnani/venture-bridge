import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User, Deal, StartupProfile, DiligenceItem
from venturebridge_shared.auth import require_portal

router = APIRouter()
admin_user = require_portal("admin")


@router.get("/dashboard")
def get_dashboard(payload: dict = Depends(admin_user), db: Session = Depends(get_db)):
    pending_users = (
        db.query(User)
        .filter(User.approved == False, User.rejectedAt == None)  # noqa: E712
        .order_by(User.createdAt.asc())
        .limit(8)
        .all()
    )

    active_deals = (
        db.query(Deal)
        .join(StartupProfile, Deal.startupId == StartupProfile.id)
        .filter(Deal.status.in_(["under_review", "live"]))
        .all()
    )

    open_diligence = (
        db.query(DiligenceItem)
        .join(Deal, DiligenceItem.dealId == Deal.id)
        .join(StartupProfile, Deal.startupId == StartupProfile.id)
        .filter(DiligenceItem.status.in_(["pending", "in_progress", "flagged"]))
        .order_by(DiligenceItem.createdAt.desc())
        .limit(5)
        .all()
    )

    analysts = (
        db.query(User)
        .filter(User.portal == "admin")
        .all()
    )

    def _user_name(u: User) -> str:
        if hasattr(u, "investorProfile") and u.investorProfile:
            return u.investorProfile.firmName
        if hasattr(u, "startupProfile") and u.startupProfile:
            return u.startupProfile.companyName
        return u.email

    return {
        "kpis": {
            "pendingApprovals": len(pending_users),
            "activeDeals":      len(active_deals),
            "escalations":      sum(1 for d in open_diligence if d.status == "flagged"),
            "openDiligence":    len(open_diligence),
        },
        "pendingUsers": [
            {
                "id":     u.id,
                "email":  u.email,
                "portal": u.portal,
                "name":   _user_name(u),
            }
            for u in pending_users
        ],
        "activeDeals": [
            {
                "id":          d.id,
                "title":       d.title,
                "companyName": d.startup.companyName,
                "status":      d.status,
            }
            for d in active_deals
        ],
        "openDiligence": [
            {
                "id":          d.id,
                "title":       d.title,
                "category":    d.category,
                "status":      d.status,
                "companyName": d.deal.startup.companyName,
            }
            for d in open_diligence
        ],
        "analysts": [
            {
                "id":            a.id,
                "email":         a.email,
                "assignedDeals": len(a.assignedDeals),
                "assignedItems": len(a.assignedItems),
            }
            for a in analysts
        ],
    }
