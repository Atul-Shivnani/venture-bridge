import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User
from venturebridge_shared.auth import require_portal

logger = logging.getLogger(__name__)

router = APIRouter()
analyst_user = require_portal("analyst")
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


@router.get("/profile")
def get_profile(payload: dict = Depends(analyst_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id":        user.id,
        "email":     user.email,
        "firstName": user.firstName,
        "lastName":  user.lastName,
        "portal":    user.portal,
        "role":      user.role,
    }


@router.get("/settings")
def get_settings(payload: dict = Depends(analyst_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "email":     user.email,
        "firstName": user.firstName,
        "lastName":  user.lastName,
    }


@router.put("/settings/password")
def change_password(
    body: ChangePasswordRequest,
    payload: dict = Depends(analyst_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_ctx.verify(body.currentPassword, user.passwordHash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.passwordHash = pwd_ctx.hash(body.newPassword)
    db.commit()
    return {"message": "Password updated successfully"}
