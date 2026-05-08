import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from venturebridge_shared.database import get_db
from venturebridge_shared.models import Deal, FinancialAnalysis
from venturebridge_shared.auth import require_portal
from services.claude_analyst import analyze_financials, MODEL

logger = logging.getLogger(__name__)

router = APIRouter()
analyst_user = require_portal("analyst")


class AnalyzeRequest(BaseModel):
    rawInput: str


@router.post("/deals/{deal_id}/analyze")
def analyze_deal(
    deal_id: str,
    body: AnalyzeRequest,
    payload: dict = Depends(analyst_user),
    db: Session = Depends(get_db),
):
    analyst_id = payload["sub"]

    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.analystId == analyst_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if not body.rawInput.strip():
        raise HTTPException(status_code=400, detail="rawInput cannot be empty")

    try:
        metrics = analyze_financials(body.rawInput)
    except RuntimeError as e:
        logger.error("Claude analysis failed for deal %s: %s", deal_id, e)
        raise HTTPException(status_code=502, detail=str(e))

    existing = db.query(FinancialAnalysis).filter(FinancialAnalysis.dealId == deal_id).first()

    if existing:
        for key, val in metrics.items():
            setattr(existing, key, val)
        existing.rawInput = body.rawInput
        existing.aiModel = MODEL
        existing.analystId = analyst_id
        existing.updatedAt = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        now = datetime.now(timezone.utc)
        record = FinancialAnalysis(
            id=str(uuid.uuid4()),
            dealId=deal_id,
            analystId=analyst_id,
            rawInput=body.rawInput,
            aiModel=MODEL,
            createdAt=now,
            updatedAt=now,
            **metrics,
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return {
        "id":               record.id,
        "dealId":           record.dealId,
        "revenue":          record.revenue,
        "revenueGrowthPct": record.revenueGrowthPct,
        "grossProfit":      record.grossProfit,
        "grossMargin":      record.grossMargin,
        "operatingProfit":  record.operatingProfit,
        "netProfit":        record.netProfit,
        "netMargin":        record.netMargin,
        "ebitda":           record.ebitda,
        "ebitdaMargin":     record.ebitdaMargin,
        "cashOnHand":       record.cashOnHand,
        "totalDebt":        record.totalDebt,
        "totalEquity":      record.totalEquity,
        "debtToEquity":     record.debtToEquity,
        "workingCapital":   record.workingCapital,
        "quickRatio":       record.quickRatio,
        "currentRatio":     record.currentRatio,
        "operatingCashFlow": record.operatingCashFlow,
        "burnRate":         record.burnRate,
        "runwayMonths":     record.runwayMonths,
        "confidence":       record.confidence,
        "aiNotes":          record.aiNotes,
        "aiModel":          record.aiModel,
        "createdAt":        record.createdAt.isoformat() if record.createdAt else None,
    }
