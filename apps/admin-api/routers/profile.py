import logging
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User
from venturebridge_shared.auth import require_portal

router = APIRouter()
admin_user = require_portal("admin")


@router.get("/profile")
def get_profile(payload: dict = Depends(admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    return {
        "user": {
            "id":        user.id,
            "email":     user.email,
            "portal":    user.portal,
            "role":      user.role,
            "approved":  user.approved,
            "createdAt": user.createdAt.isoformat() if user.createdAt else None,
        } if user else None
    }


@router.get("/settings")
def get_settings(payload: dict = Depends(admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    return {
        "user": {
            "id":        user.id,
            "email":     user.email,
            "portal":    user.portal,
            "role":      user.role,
            "approved":  user.approved,
            "createdAt": user.createdAt.isoformat() if user.createdAt else None,
        } if user else None
    }


class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str


@router.put("/settings/password")
def change_password(
    body: PasswordChange,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.checkpw(body.currentPassword.encode(), user.passwordHash.encode()):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(body.newPassword) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    user.passwordHash = bcrypt.hashpw(body.newPassword.encode(), bcrypt.gensalt(12)).decode()
    db.commit()
    return {"success": True}
