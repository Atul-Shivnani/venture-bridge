import logging
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import User, InvestorProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
investor_user = require_portal("investor")


class ProfileUpdate(BaseModel):
    firmName: Optional[str] = None
    investorType: Optional[str] = None
    ticketSizeLabel: Optional[str] = None
    ticketMin: Optional[float] = None
    ticketMax: Optional[float] = None
    geographies: Optional[List[str]] = None
    sectors: Optional[List[str]] = None
    stagesAllowed: Optional[List[str]] = None
    instrumentTypesAllowed: Optional[List[str]] = None
    revenueFloor: Optional[float] = None
    profitabilityPreference: Optional[str] = None
    esgExclusions: Optional[List[str]] = None
    regulatoryExclusions: Optional[List[str]] = None


ALLOWED_INVESTOR_TYPES = {"vc", "family_office", "angel", "bank", "corporate_vc", "other"}


def _serialize_profile(profile):
    return {
        "id":                      profile.id,
        "firmName":                profile.firmName,
        "investorType":            profile.investorType,
        "ticketSizeLabel":         profile.ticketSizeLabel,
        "ticketMin":               profile.ticketMin,
        "ticketMax":               profile.ticketMax,
        "geographies":             profile.geographies,
        "sectors":                 profile.sectors,
        "stagesAllowed":           profile.stagesAllowed,
        "instrumentTypesAllowed":  profile.instrumentTypesAllowed,
        "revenueFloor":            profile.revenueFloor,
        "profitabilityPreference": profile.profitabilityPreference,
        "esgExclusions":           profile.esgExclusions,
        "regulatoryExclusions":    profile.regulatoryExclusions,
    }


@router.get("/profile")
def get_profile(payload: dict = Depends(investor_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]
    user    = db.query(User).filter(User.id == user_id).first()
    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()

    return {
        "user": {
            "id":        user.id,
            "email":     user.email,
            "portal":    user.portal,
            "role":      user.role,
            "approved":  user.approved,
            "createdAt": user.createdAt.isoformat() if user.createdAt else None,
        } if user else None,
        "profile": _serialize_profile(profile) if profile else None,
    }


@router.put("/profile")
def update_profile(
    body: ProfileUpdate,
    payload: dict = Depends(investor_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    profile = db.query(InvestorProfile).filter(InvestorProfile.userId == user_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found")

    update_data = body.dict(exclude_unset=True)

    if "investorType" in update_data and update_data["investorType"] not in ALLOWED_INVESTOR_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid investor type. Must be one of: {', '.join(ALLOWED_INVESTOR_TYPES)}")

    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return {
        "success": True,
        "profile": _serialize_profile(profile),
    }


@router.get("/settings")
def get_settings(payload: dict = Depends(investor_user), db: Session = Depends(get_db)):
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
    payload: dict = Depends(investor_user),
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
