import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from venturebridge_shared.database import get_db
from venturebridge_shared.models import Deal, DealMatch, FinancialAnalysis, Document
from venturebridge_shared.auth import require_portal

logger = logging.getLogger(__name__)

router = APIRouter()
analyst_user = require_portal("analyst")


@router.get("/deals")
def list_deals(payload: dict = Depends(analyst_user), db: Session = Depends(get_db)):
    analyst_id = payload["sub"]
    deals = (
        db.query(Deal)
        .filter(Deal.analystId == analyst_id)
        .order_by(Deal.createdAt.desc())
        .all()
    )

    analyzed_ids = {
        row.dealId for row in db.query(FinancialAnalysis.dealId)
        .filter(FinancialAnalysis.analystId == analyst_id)
        .all()
    }

    return {
        "deals": [
            {
                "id":           d.id,
                "title":        d.title,
                "companyName":  d.startup.companyName,
                "sector":       d.startup.sector,
                "stage":        d.stage,
                "targetAmount": d.targetAmount,
                "currency":     d.currency,
                "status":       d.status,
                "analyzed":     d.id in analyzed_ids,
                "matchCount":   len(d.matches),
                "pendingMatches": sum(1 for m in d.matches if m.status == "pending"),
                "createdAt":    d.createdAt.isoformat() if d.createdAt else None,
            }
            for d in deals
        ]
    }


@router.get("/deals/{deal_id}")
def get_deal(deal_id: str, payload: dict = Depends(analyst_user), db: Session = Depends(get_db)):
    analyst_id = payload["sub"]
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.analystId == analyst_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    analysis = db.query(FinancialAnalysis).filter(FinancialAnalysis.dealId == deal_id).first()
    documents = db.query(Document).filter(Document.dealId == deal_id).all()

    matches_data = []
    for m in deal.matches:
        inv = m.investor
        matches_data.append({
            "id":          m.id,
            "status":      m.status,
            "matchScore":  m.matchScore,
            "investor": {
                "id":           inv.id,
                "firmName":     inv.firmName,
                "investorType": inv.investorType,
                "ticketMin":    inv.ticketMin,
                "ticketMax":    inv.ticketMax,
                "sectors":      inv.sectors,
                "stagesAllowed": inv.stagesAllowed,
                "geographies":  inv.geographies,
            },
        })

    def _fmt_analysis(a):
        if not a:
            return None
        return {
            "id":               a.id,
            "revenue":          a.revenue,
            "revenueGrowthPct": a.revenueGrowthPct,
            "grossProfit":      a.grossProfit,
            "grossMargin":      a.grossMargin,
            "operatingProfit":  a.operatingProfit,
            "netProfit":        a.netProfit,
            "netMargin":        a.netMargin,
            "ebitda":           a.ebitda,
            "ebitdaMargin":     a.ebitdaMargin,
            "cashOnHand":       a.cashOnHand,
            "totalDebt":        a.totalDebt,
            "totalEquity":      a.totalEquity,
            "debtToEquity":     a.debtToEquity,
            "workingCapital":   a.workingCapital,
            "quickRatio":       a.quickRatio,
            "currentRatio":     a.currentRatio,
            "operatingCashFlow": a.operatingCashFlow,
            "burnRate":         a.burnRate,
            "runwayMonths":     a.runwayMonths,
            "confidence":       a.confidence,
            "aiNotes":          a.aiNotes,
            "aiModel":          a.aiModel,
            "createdAt":        a.createdAt.isoformat() if a.createdAt else None,
        }

    return {
        "deal": {
            "id":           deal.id,
            "title":        deal.title,
            "stage":        deal.stage,
            "targetAmount": deal.targetAmount,
            "currency":     deal.currency,
            "status":       deal.status,
            "createdAt":    deal.createdAt.isoformat() if deal.createdAt else None,
        },
        "startup": {
            "companyName":    deal.startup.companyName,
            "sector":         deal.startup.sector,
            "subSector":      deal.startup.subSector,
            "country":        deal.startup.country,
            "fundingStage":   deal.startup.fundingStage,
            "teamSize":       deal.startup.teamSize,
            "website":        deal.startup.website,
            "description":    deal.startup.description,
            "businessModel":  deal.startup.businessModel,
            "arr":            deal.startup.arr,
            "amountRaising":  deal.startup.amountRaising,
            "instrumentType": deal.startup.instrumentType,
            "useOfFunds":     deal.startup.useOfFunds,
        },
        "analysis":  _fmt_analysis(analysis),
        "matches":   matches_data,
        "documents": [
            {"id": d.id, "filename": d.filename, "type": d.type, "url": d.url}
            for d in documents
        ],
        "notes": [
            {"id": n.id, "content": n.content, "flagType": n.flagType,
             "createdAt": n.createdAt.isoformat() if n.createdAt else None}
            for n in deal.notes
        ],
    }
