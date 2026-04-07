import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User
from venturebridge_shared.auth import require_portal

router = APIRouter(prefix="/approvals")
admin_user = require_portal("admin")


@router.get("")
def list_approvals(payload: dict = Depends(admin_user), db: Session = Depends(get_db)):
    pending = (
        db.query(User)
        .filter(User.approved == False, User.rejectedAt == None)  # noqa: E712
        .order_by(User.createdAt.asc())
        .all()
    )

    recently_approved = (
        db.query(User)
        .filter(User.approved == True, User.portal.in_(["investor", "startup"]))  # noqa: E712
        .order_by(User.updatedAt.desc())
        .limit(5)
        .all()
    )

    def _serialize(u: User) -> dict:
        profile = u.investorProfile or u.startupProfile
        name = getattr(profile, "firmName", None) or getattr(profile, "companyName", None) or u.email
        detail = ""
        if u.investorProfile:
            detail = f"{u.investorProfile.investorType} · {u.investorProfile.ticketSizeLabel or ''}"
        elif u.startupProfile:
            detail = f"{u.startupProfile.sector} · {u.startupProfile.fundingStage}"
        return {
            "id":     u.id,
            "email":  u.email,
            "portal": u.portal,
            "name":   name,
            "detail": detail,
        }

    return {
        "pending":          [_serialize(u) for u in pending],
        "recentlyApproved": [_serialize(u) for u in recently_approved],
    }


class ApprovalAction(BaseModel):
    action: str  # "approve" | "reject"


@router.post("/{user_id}/approve")
def approve_user(
    user_id: str,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.approved = True
    db.commit()
    return {"success": True, "approved": True}


@router.post("/{user_id}/reject")
def reject_user(
    user_id: str,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.rejectedAt = datetime.now(timezone.utc)
    user.updatedAt = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "rejected": True}
