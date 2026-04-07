import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import DiligenceItem, Document, Deal, StartupProfile, InvestorProfile
from venturebridge_shared.auth import require_portal

router = APIRouter()
admin_user = require_portal("admin")


@router.get("/compliance")
def get_compliance(payload: dict = Depends(admin_user), db: Session = Depends(get_db)):
    # Flagged diligence items
    flagged_diligence = (
        db.query(DiligenceItem)
        .join(Deal,           DiligenceItem.dealId    == Deal.id)
        .join(StartupProfile, Deal.startupId          == StartupProfile.id)
        .join(InvestorProfile, DiligenceItem.investorId == InvestorProfile.id)
        .filter(DiligenceItem.status == "flagged")
        .order_by(DiligenceItem.updatedAt.desc())
        .all()
    )

    # Flagged documents
    flagged_documents = (
        db.query(Document)
        .join(StartupProfile, Document.startupId == StartupProfile.id)
        .filter(Document.status == "flagged")
        .order_by(Document.createdAt.desc())
        .all()
    )

    return {
        "counts": {
            "flaggedDiligence": len(flagged_diligence),
            "flaggedDocuments": len(flagged_documents),
        },
        "flaggedDiligence": [
            {
                "id":           item.id,
                "title":        item.title,
                "category":     item.category,
                "notes":        item.notes,
                "companyName":  item.deal.startup.companyName,
                "dealTitle":    item.deal.title,
                "investorFirm": item.investor.firmName,
            }
            for item in flagged_diligence
        ],
        "flaggedDocuments": [
            {
                "id":          doc.id,
                "filename":    doc.filename,
                "type":        doc.type,
                "companyName": doc.startup.companyName,
                "createdAt":   doc.createdAt.isoformat() if doc.createdAt else None,
            }
            for doc in flagged_documents
        ],
    }
