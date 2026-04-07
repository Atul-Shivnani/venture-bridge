import logging
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User, StartupProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
startup_user = require_portal("startup")


class ProfileUpdate(BaseModel):
    companyName: Optional[str] = None
    sector: Optional[str] = None
    subSector: Optional[str] = None
    country: Optional[str] = None
    fundingStage: Optional[str] = None
    foundedYear: Optional[int] = None
    teamSize: Optional[int] = None
    website: Optional[str] = None
    description: Optional[str] = None
    businessModel: Optional[str] = None
    customersServed: Optional[str] = None
    amountRaising: Optional[float] = None
    instrumentType: Optional[str] = None
    useOfFunds: Optional[str] = None
    arr: Optional[float] = None


ALLOWED_STAGES = {"idea", "pre_seed", "seed", "series_a", "series_b", "growth"}


@router.get("/profile")
def get_profile(payload: dict = Depends(startup_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]
    user    = db.query(User).filter(User.id == user_id).first()
    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()

    return {
        "user": {
            "id":        user.id,
            "email":     user.email,
            "portal":    user.portal,
            "role":      user.role,
            "approved":  user.approved,
            "createdAt": user.createdAt.isoformat() if user.createdAt else None,
        } if user else None,
        "profile": {
            "id":              profile.id,
            "companyName":     profile.companyName,
            "sector":          profile.sector,
            "subSector":       profile.subSector,
            "country":         profile.country,
            "fundingStage":    profile.fundingStage,
            "foundedYear":     profile.foundedYear,
            "teamSize":        profile.teamSize,
            "website":         profile.website,
            "description":     profile.description,
            "businessModel":   profile.businessModel,
            "customersServed": profile.customersServed,
            "amountRaising":   profile.amountRaising,
            "instrumentType":  profile.instrumentType,
            "useOfFunds":      profile.useOfFunds,
            "arr":             profile.arr,
        } if profile else None,
    }


@router.put("/profile")
def update_profile(
    body: ProfileUpdate,
    payload: dict = Depends(startup_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    # Update only provided fields
    update_data = body.dict(exclude_unset=True)

    if "fundingStage" in update_data and update_data["fundingStage"] not in ALLOWED_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid funding stage. Must be one of: {', '.join(ALLOWED_STAGES)}")

    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return {
        "success": True,
        "profile": {
            "id":              profile.id,
            "companyName":     profile.companyName,
            "sector":          profile.sector,
            "subSector":       profile.subSector,
            "country":         profile.country,
            "fundingStage":    profile.fundingStage,
            "foundedYear":     profile.foundedYear,
            "teamSize":        profile.teamSize,
            "website":         profile.website,
            "description":     profile.description,
            "businessModel":   profile.businessModel,
            "customersServed": profile.customersServed,
            "amountRaising":   profile.amountRaising,
            "instrumentType":  profile.instrumentType,
            "useOfFunds":      profile.useOfFunds,
            "arr":             profile.arr,
        },
    }


@router.get("/settings")
def get_settings(payload: dict = Depends(startup_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]
    user    = db.query(User).filter(User.id == user_id).first()
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
    payload: dict = Depends(startup_user),
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
