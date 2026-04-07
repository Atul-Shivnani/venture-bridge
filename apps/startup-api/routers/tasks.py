import logging
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import StartupProfile, Deal, DiligenceItem, InvestorProfile, User
from venturebridge_shared.auth import require_portal

router = APIRouter()
startup_user = require_portal("startup")

ALLOWED_CATEGORIES = {"financial", "legal", "governance", "market", "team"}
ALLOWED_STATUSES   = {"pending", "in_progress", "complete", "flagged"}


@router.get("/tasks")
def get_tasks(payload: dict = Depends(startup_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]

    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        return {"counts": {"open": 0, "flagged": 0, "complete": 0}, "items": [], "deals": []}

    deals = db.query(Deal).filter(Deal.startupId == profile.id).all()
    deal_ids = [d.id for d in deals]
    deal_map = {d.id: d.title for d in deals}

    if not deal_ids:
        return {"counts": {"open": 0, "flagged": 0, "complete": 0}, "items": [], "deals": []}

    items = (
        db.query(DiligenceItem)
        .filter(DiligenceItem.dealId.in_(deal_ids))
        .order_by(DiligenceItem.createdAt.desc())
        .all()
    )

    open_count     = sum(1 for i in items if i.status not in ("complete",))
    flagged_count  = sum(1 for i in items if i.status == "flagged")
    complete_count = sum(1 for i in items if i.status == "complete")

    # Prefetch investor profiles and assignees
    investor_ids = list({i.investorId for i in items if i.investorId})
    investor_map = {}
    if investor_ids:
        investors = db.query(InvestorProfile).filter(InvestorProfile.id.in_(investor_ids)).all()
        investor_map = {inv.id: inv.firmName for inv in investors}

    assignee_ids = list({i.assignedToId for i in items if i.assignedToId})
    assignee_map = {}
    if assignee_ids:
        assignees = db.query(User).filter(User.id.in_(assignee_ids)).all()
        assignee_map = {u.id: u.email for u in assignees}

    return {
        "counts": {
            "open":     open_count,
            "flagged":  flagged_count,
            "complete": complete_count,
        },
        "deals": [{"id": d.id, "title": d.title} for d in deals],
        "items": [
            {
                "id":          item.id,
                "title":       item.title,
                "category":    item.category,
                "status":      item.status,
                "notes":       item.notes,
                "dealId":      item.dealId,
                "dealTitle":   deal_map.get(item.dealId, ""),
                "investorFirm": investor_map.get(item.investorId, "") if item.investorId else "",
                "assignedTo":  assignee_map.get(item.assignedToId) if item.assignedToId else None,
            }
            for item in items
        ],
    }


class TaskCreate(BaseModel):
    category: str
    title: str
    notes: Optional[str] = None
    dealId: Optional[str] = None


@router.post("/tasks")
def create_task(
    body: TaskCreate,
    payload: dict = Depends(startup_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]

    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    if body.category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(ALLOWED_CATEGORIES)}")

    # If dealId provided, verify it belongs to this startup
    deal_id = body.dealId
    if deal_id:
        deal = db.query(Deal).filter(Deal.id == deal_id, Deal.startupId == profile.id).first()
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
    else:
        # Use first available deal if exists, else raise
        first_deal = db.query(Deal).filter(Deal.startupId == profile.id).first()
        if not first_deal:
            raise HTTPException(status_code=400, detail="Create a deal first before adding tasks")
        deal_id = first_deal.id

    now = datetime.now(timezone.utc)
    item = DiligenceItem(
        id=str(uuid.uuid4()),
        dealId=deal_id,
        investorId=None,
        assignedToId=None,
        category=body.category,
        title=body.title,
        notes=body.notes,
        status="pending",
        createdAt=now,
        updatedAt=now,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "success": True,
        "item": {
            "id":       item.id,
            "title":    item.title,
            "category": item.category,
            "status":   item.status,
        },
    }


class TaskStatusUpdate(BaseModel):
    status: str


@router.put("/tasks/{task_id}/status")
def update_task_status(
    task_id: str,
    body: TaskStatusUpdate,
    payload: dict = Depends(startup_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]

    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    # Ensure task belongs to one of this startup's deals
    deal_ids = [d.id for d in db.query(Deal).filter(Deal.startupId == profile.id).all()]
    item = db.query(DiligenceItem).filter(
        DiligenceItem.id == task_id,
        DiligenceItem.dealId.in_(deal_ids),
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Task not found")

    if body.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(ALLOWED_STATUSES)}")

    item.status = body.status
    item.updatedAt = datetime.now(timezone.utc)
    db.commit()

    return {"success": True, "status": item.status}
