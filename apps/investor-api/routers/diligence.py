import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import InvestorProfile, DiligenceItem, Deal, StartupProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
investor_user = require_portal("investor")

ALLOWED_STATUSES = {"pending", "in_progress", "complete", "flagged"}


@router.get("/diligence")
def get_diligence(payload: dict = Depends(investor_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]

    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()
    if not profile:
        return {"items": [], "counts": {"open": 0, "flagged": 0, "complete": 0}}

    items = (
        db.query(DiligenceItem)
        .join(Deal,          DiligenceItem.dealId  == Deal.id)
        .join(StartupProfile, Deal.startupId       == StartupProfile.id)
        .filter(DiligenceItem.investorId == profile.id)
        .order_by(DiligenceItem.status.asc(), DiligenceItem.createdAt.desc())
        .all()
    )

    return {
        "items": [
            {
                "id":          i.id,
                "title":       i.title,
                "category":    i.category,
                "status":      i.status,
                "notes":       i.notes,
                "companyName": i.deal.startup.companyName,
                "assignedTo":  i.assignedTo.email if i.assignedTo else None,
            }
            for i in items
        ],
        "counts": {
            "open":     sum(1 for i in items if i.status != "complete"),
            "flagged":  sum(1 for i in items if i.status == "flagged"),
            "complete": sum(1 for i in items if i.status == "complete"),
        },
    }


class DiligenceStatusUpdate(BaseModel):
    status: str


@router.put("/diligence/{item_id}/status")
def update_diligence_status(
    item_id: str,
    body: DiligenceStatusUpdate,
    payload: dict = Depends(investor_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]

    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found")

    item = db.query(DiligenceItem).filter(
        DiligenceItem.id == item_id,
        DiligenceItem.investorId == profile.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Diligence item not found")

    if body.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(ALLOWED_STATUSES)}")

    item.status = body.status
    item.updatedAt = datetime.now(timezone.utc)
    db.commit()

    return {"success": True, "status": item.status}
