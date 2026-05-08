import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from venturebridge_shared.database import get_db
from venturebridge_shared.models import Deal, DealMatch, FinancialAnalysis
from venturebridge_shared.auth import require_portal

logger = logging.getLogger(__name__)

router = APIRouter()
analyst_user = require_portal("analyst")


@router.get("/dashboard")
def get_dashboard(payload: dict = Depends(analyst_user), db: Session = Depends(get_db)):
    analyst_id = payload["sub"]

    assigned = (
        db.query(Deal)
        .filter(Deal.analystId == analyst_id)
        .all()
    )

    analyzed_deal_ids = {
        row.dealId for row in db.query(FinancialAnalysis.dealId)
        .filter(FinancialAnalysis.analystId == analyst_id)
        .all()
    }

    pending_analysis = [d for d in assigned if d.id not in analyzed_deal_ids]

    pending_matches = (
        db.query(DealMatch)
        .join(Deal, DealMatch.dealId == Deal.id)
        .filter(Deal.analystId == analyst_id, DealMatch.status == "pending")
        .all()
    )

    return {
        "kpis": {
            "assignedDeals":    len(assigned),
            "pendingAnalysis":  len(pending_analysis),
            "matchesToReview":  len(pending_matches),
            "analyzed":         len(analyzed_deal_ids),
        },
        "pendingAnalysis": [
            {
                "id":          d.id,
                "title":       d.title,
                "companyName": d.startup.companyName,
                "stage":       d.stage,
                "status":      d.status,
            }
            for d in pending_analysis[:5]
        ],
        "recentDeals": [
            {
                "id":          d.id,
                "title":       d.title,
                "companyName": d.startup.companyName,
                "stage":       d.stage,
                "status":      d.status,
                "analyzed":    d.id in analyzed_deal_ids,
                "matchCount":  len(d.matches),
            }
            for d in sorted(assigned, key=lambda x: x.createdAt, reverse=True)[:8]
        ],
    }
