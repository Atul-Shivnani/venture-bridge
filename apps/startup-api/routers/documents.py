import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import StartupProfile, Document, Deal
from venturebridge_shared.auth import require_portal

router = APIRouter()
startup_user = require_portal("startup")


@router.get("/documents")
def get_documents(payload: dict = Depends(startup_user), db: Session = Depends(get_db)):
    user_id = payload["sub"]

    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        return {"documents": []}

    docs = (
        db.query(Document)
        .filter(Document.startupId == profile.id)
        .order_by(Document.createdAt.desc())
        .all()
    )

    # Build deal title lookup
    deal_ids = [d.dealId for d in docs if d.dealId]
    deal_map = {}
    if deal_ids:
        deals = db.query(Deal).filter(Deal.id.in_(deal_ids)).all()
        deal_map = {d.id: d.title for d in deals}

    return {
        "documents": [
            {
                "id":        doc.id,
                "type":      doc.type,
                "filename":  doc.filename,
                "url":       doc.url,
                "status":    doc.status,
                "dealId":    doc.dealId,
                "dealTitle": deal_map.get(doc.dealId) if doc.dealId else None,
                "createdAt": doc.createdAt.isoformat() if doc.createdAt else None,
            }
            for doc in docs
        ]
    }


ALLOWED_DOC_TYPES = {"pitch_deck", "financial_model", "cap_table", "legal", "other"}


class DocumentCreate(BaseModel):
    type: str
    filename: str
    url: str
    dealId: Optional[str] = None


@router.post("/documents")
def create_document(
    body: DocumentCreate,
    payload: dict = Depends(startup_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    profile = db.query(StartupProfile).filter(StartupProfile.userId == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    if body.type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type. Must be one of: {', '.join(ALLOWED_DOC_TYPES)}")

    doc = Document(
        id=str(uuid.uuid4()),
        startupId=profile.id,
        uploadedById=user_id,
        type=body.type,
        filename=body.filename,
        url=body.url,
        status="pending",
        dealId=body.dealId,
        createdAt=datetime.now(timezone.utc),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "success": True,
        "document": {
            "id":       doc.id,
            "type":     doc.type,
            "filename": doc.filename,
            "url":      doc.url,
            "status":   doc.status,
        },
    }
