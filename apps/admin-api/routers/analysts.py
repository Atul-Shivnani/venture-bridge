import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User, Deal
from venturebridge_shared.auth import require_portal

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()
admin_user = require_portal("admin")


@router.get("/analysts")
def get_analysts(payload: dict = Depends(admin_user), db: Session = Depends(get_db)):
    analysts = (
        db.query(User)
        .filter(User.role == "admin")
        .order_by(User.createdAt.asc())
        .all()
    )

    analyst_ids = [a.id for a in analysts]
    deal_counts: dict[str, int] = {}
    if analyst_ids:
        deals = db.query(Deal).filter(Deal.analystId.in_(analyst_ids)).all()
        for deal in deals:
            deal_counts[deal.analystId] = deal_counts.get(deal.analystId, 0) + 1

    return {
        "total": len(analysts),
        "analysts": [
            {
                "id":                a.id,
                "email":             a.email,
                "createdAt":         a.createdAt.isoformat() if a.createdAt else None,
                "assignedDealCount": deal_counts.get(a.id, 0),
            }
            for a in analysts
        ],
    }


class AnalystCreate(BaseModel):
    email: str
    password: str


@router.post("/analysts")
def create_analyst(
    body: AnalystCreate,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="A user with that email already exists")

    password_hash = pwd_context.hash(body.password)
    now = datetime.now(timezone.utc)
    analyst = User(
        id=str(uuid.uuid4()),
        email=body.email,
        passwordHash=password_hash,
        portal="admin",
        role="admin",
        approved=True,
        createdAt=now,
        updatedAt=now,
    )
    db.add(analyst)
    db.commit()
    db.refresh(analyst)

    return {
        "success": True,
        "analyst": {
            "id":    analyst.id,
            "email": analyst.email,
        },
    }


@router.delete("/analysts/{analyst_id}")
def delete_analyst(
    analyst_id: str,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    # Prevent self-deletion
    if analyst_id == payload["sub"]:
        raise HTTPException(status_code=400, detail="Cannot remove your own account")

    analyst = db.query(User).filter(User.id == analyst_id, User.role == "admin").first()
    if not analyst:
        raise HTTPException(status_code=404, detail="Analyst not found")

    # Unassign their deals before deleting
    db.query(Deal).filter(Deal.analystId == analyst_id).update({"analystId": None})

    db.delete(analyst)
    db.commit()
    return {"success": True}
