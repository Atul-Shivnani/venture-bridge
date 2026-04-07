import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import DiligenceItem, Deal, StartupProfile, User
from venturebridge_shared.auth import require_portal

router = APIRouter()
admin_user = require_portal("admin")

ALLOWED_STATUSES = {"pending", "in_progress", "complete", "flagged"}


@router.get("/diligence")
def list_diligence(
    status: Optional[str] = None,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(DiligenceItem)
        .join(Deal, DiligenceItem.dealId == Deal.id)
        .join(StartupProfile, Deal.startupId == StartupProfile.id)
    )

    if status and status in ALLOWED_STATUSES:
        query = query.filter(DiligenceItem.status == status)

    items = query.order_by(DiligenceItem.updatedAt.desc()).all()

    counts = {"pending": 0, "in_progress": 0, "complete": 0, "flagged": 0}
    for item in items:
        if item.status in counts:
            counts[item.status] += 1

    analysts = (
        db.query(User)
        .filter(User.role == "admin")
        .order_by(User.email.asc())
        .all()
    )

    return {
        "counts": counts,
        "analysts": [{"id": a.id, "email": a.email} for a in analysts],
        "items": [
            {
                "id":           item.id,
                "dealId":       item.dealId,
                "companyName":  item.deal.startup.companyName,
                "dealTitle":    item.deal.title,
                "category":     item.category,
                "title":        item.title,
                "notes":        item.notes,
                "status":       item.status,
                "assignedToId": item.assignedToId,
                "assignedTo":   item.assignedTo.email if item.assignedTo else None,
                "investorFirm": item.investor.firmName if item.investor else None,
                "createdAt":    item.createdAt.isoformat() if item.createdAt else None,
            }
            for item in items
        ],
    }


class DiligenceStatusUpdate(BaseModel):
    status: str


@router.put("/diligence/{item_id}/status")
def update_diligence_status(
    item_id: str,
    body: DiligenceStatusUpdate,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    if body.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(ALLOWED_STATUSES)}")

    item = db.query(DiligenceItem).filter(DiligenceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Diligence item not found")

    item.status = body.status
    item.updatedAt = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "status": item.status}


class DiligenceAssign(BaseModel):
    analystId: Optional[str] = None


@router.put("/diligence/{item_id}/assign")
def assign_diligence_item(
    item_id: str,
    body: DiligenceAssign,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    item = db.query(DiligenceItem).filter(DiligenceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Diligence item not found")

    if body.analystId:
        analyst = db.query(User).filter(User.id == body.analystId, User.role == "admin").first()
        if not analyst:
            raise HTTPException(status_code=404, detail="Analyst not found")

    item.assignedToId = body.analystId
    item.updatedAt = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "assignedToId": item.assignedToId}
