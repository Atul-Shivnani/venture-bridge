import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from venturebridge_shared.database import get_db
from venturebridge_shared.models import Deal, StartupProfile, DealMatch, DiligenceItem, User, AnalystNote, TermSheet
from venturebridge_shared.auth import require_portal

router = APIRouter(prefix="/deals")
admin_user = require_portal("admin")

STAGE_LABELS = {
    "idea": "Idea", "pre_seed": "Pre-seed", "seed": "Seed",
    "series_a": "Series A", "series_b": "Series B", "growth": "Growth",
}
ALLOWED_STATUSES = {"draft", "under_review", "approved", "live", "closed", "rejected"}


def _serialize(d):
    return {
        "id":             d.id,
        "title":          d.title,
        "companyName":    d.startup.companyName,
        "stage":          STAGE_LABELS.get(d.stage, d.stage),
        "targetAmount":   d.targetAmount,
        "currency":       d.currency,
        "status":         d.status,
        "analystId":      d.analystId,
        "analystEmail":   d.analyst.email if d.analyst else None,
        "matchCount":     len(d.matches),
        "diligenceCount": len(d.diligence),
        "noteCount":      len(d.notes),
    }


@router.get("")
def list_deals(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(Deal).join(StartupProfile, Deal.startupId == StartupProfile.id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Deal.title.ilike(search_term)) |
            (StartupProfile.companyName.ilike(search_term))
        )

    total = query.count()
    deals = query.order_by(Deal.createdAt.desc()).offset(skip).limit(limit).all()

    return {
        "deals": [_serialize(d) for d in deals],
        "pagination": {
            "skip": skip,
            "limit": limit,
            "total": total,
        }
    }


class DealStatusUpdate(BaseModel):
    status: str


@router.put("/{deal_id}/status")
def update_deal_status(
    deal_id: str,
    body: DealStatusUpdate,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if body.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(ALLOWED_STATUSES)}")

    deal.status = body.status
    deal.updatedAt = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "status": deal.status}


class DealAssign(BaseModel):
    analystId: Optional[str] = None


@router.put("/{deal_id}/assign")
def assign_deal(
    deal_id: str,
    body: DealAssign,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if body.analystId:
        analyst = db.query(User).filter(User.id == body.analystId, User.role == "admin").first()
        if not analyst:
            raise HTTPException(status_code=404, detail="Analyst not found")

    deal.analystId = body.analystId
    deal.updatedAt = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "analystId": deal.analystId}


class DiligenceCreate(BaseModel):
    dealId: str
    investorId: Optional[str] = None
    category: str
    title: str
    notes: Optional[str] = None
    assignedToId: Optional[str] = None


ALLOWED_CATEGORIES = {"financial", "legal", "governance", "market", "team"}


@router.post("/diligence")
def create_diligence_item(
    body: DiligenceCreate,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == body.dealId).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if body.category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(ALLOWED_CATEGORIES)}")

    now = datetime.now(timezone.utc)
    item = DiligenceItem(
        id=str(uuid.uuid4()),
        dealId=body.dealId,
        investorId=body.investorId,
        assignedToId=body.assignedToId,
        category=body.category,
        title=body.title,
        notes=body.notes,
        status="pending",
        createdAt=now,
        updatedAt=now,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "success": True,
        "item": {
            "id":       item.id,
            "title":    item.title,
            "category": item.category,
            "status":   item.status,
        },
    }


# ── Matching engine ─────────────────────────────────────────────────────

from venturebridge_shared.models import InvestorProfile

STAGE_WEIGHTS = {
    "idea": 1, "pre_seed": 2, "seed": 3,
    "series_a": 4, "series_b": 5, "growth": 6,
}


def _compute_match_score(deal: Deal, startup: StartupProfile, investor: InvestorProfile) -> int:
    """Simple scoring: 0-100 based on sector, stage, ticket size, and geography overlap."""
    score = 0

    # Sector match (30 pts)
    inv_sectors = investor.sectors or []
    if startup.sector and startup.sector.lower() in [s.lower() for s in inv_sectors]:
        score += 30
    elif not inv_sectors:
        score += 15  # no preference = partial match

    # Stage match (25 pts)
    inv_stages = investor.stagesAllowed or []
    if deal.stage in inv_stages:
        score += 25
    elif not inv_stages:
        score += 12

    # Ticket size match (25 pts)
    if investor.ticketMin is not None and investor.ticketMax is not None:
        if investor.ticketMin <= deal.targetAmount <= investor.ticketMax:
            score += 25
        elif deal.targetAmount <= investor.ticketMax * 1.5:
            score += 10
    else:
        score += 12  # no preference

    # Geography match (20 pts)
    inv_geos = investor.geographies or []
    if startup.country and startup.country.lower() in [g.lower() for g in inv_geos]:
        score += 20
    elif not inv_geos:
        score += 10

    return min(score, 100)


@router.post("/{deal_id}/match")
def run_matching(
    deal_id: str,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    startup = db.query(StartupProfile).filter(StartupProfile.id == deal.startupId).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Associated startup not found")

    # Get all approved investors
    investors = (
        db.query(InvestorProfile)
        .join(User, InvestorProfile.userId == User.id)
        .filter(User.approved == True)  # noqa: E712
        .all()
    )

    # Get existing matches to skip
    existing_ids = {
        m.investorId
        for m in db.query(DealMatch).filter(DealMatch.dealId == deal_id).all()
    }

    now = datetime.now(timezone.utc)
    created = 0

    for inv in investors:
        if inv.id in existing_ids:
            continue

        score = _compute_match_score(deal, startup, inv)
        if score < 20:
            continue  # too weak

        match = DealMatch(
            id=str(uuid.uuid4()),
            dealId=deal_id,
            investorId=inv.id,
            matchScore=score,
            status="pending",
            createdAt=now,
            updatedAt=now,
        )
        db.add(match)
        created += 1

    db.commit()

    return {
        "success": True,
        "matchesCreated": created,
        "totalInvestors": len(investors),
        "skippedExisting": len(existing_ids),
    }


# ── Analyst Notes ───────────────────────────────────────────────────────

ALLOWED_FLAG_TYPES = {"positive", "warning", "critical"}


@router.get("/{deal_id}/notes")
def get_notes(
    deal_id: str,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    return {
        "notes": [
            {
                "id":        n.id,
                "content":   n.content,
                "flagType":  n.flagType,
                "authorEmail": n.author.email if n.author else None,
                "createdAt": n.createdAt.isoformat() if n.createdAt else None,
            }
            for n in deal.notes
        ]
    }


class NoteCreate(BaseModel):
    content: str
    flagType: str


@router.post("/{deal_id}/notes")
def create_note(
    deal_id: str,
    body: NoteCreate,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if body.flagType not in ALLOWED_FLAG_TYPES:
        raise HTTPException(status_code=400, detail=f"flagType must be one of: {', '.join(ALLOWED_FLAG_TYPES)}")

    now = datetime.now(timezone.utc)
    note = AnalystNote(
        id=str(uuid.uuid4()),
        dealId=deal_id,
        authorId=payload["sub"],
        content=body.content,
        flagType=body.flagType,
        createdAt=now,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "success": True,
        "note": {
            "id":       note.id,
            "content":  note.content,
            "flagType": note.flagType,
            "createdAt": note.createdAt.isoformat(),
        },
    }


# ── Term Sheets ──────────────────────────────────────────────────────────

ALLOWED_TERM_SHEET_STATUSES = {"draft", "sent", "countered", "accepted", "rejected"}


class TermSheetCreate(BaseModel):
    matchId: str
    proposedAmount: float
    valuation: float
    terms: dict
    status: Optional[str] = "draft"


@router.post("/{deal_id}/term-sheet")
def create_term_sheet(
    deal_id: str,
    body: TermSheetCreate,
    payload: dict = Depends(admin_user),
    db: Session = Depends(get_db),
):
    match = db.query(DealMatch).filter(
        DealMatch.id == body.matchId,
        DealMatch.dealId == deal_id,
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Deal match not found")

    existing = db.query(TermSheet).filter(TermSheet.dealMatchId == body.matchId).first()
    if existing:
        # Update existing term sheet
        existing.proposedAmount = body.proposedAmount
        existing.valuation = body.valuation
        existing.terms = body.terms
        existing.status = body.status or existing.status
        existing.updatedAt = datetime.now(timezone.utc)
        db.commit()
        return {"success": True, "termSheetId": existing.id, "updated": True}

    status = body.status if body.status in ALLOWED_TERM_SHEET_STATUSES else "draft"
    now = datetime.now(timezone.utc)
    ts = TermSheet(
        id=str(uuid.uuid4()),
        dealMatchId=body.matchId,
        proposedAmount=body.proposedAmount,
        valuation=body.valuation,
        terms=body.terms,
        status=status,
        createdAt=now,
        updatedAt=now,
    )
    db.add(ts)
    db.commit()
    return {"success": True, "termSheetId": ts.id, "updated": False}


# ── CSV Export ──────────────────────────────────────────────────────────

from fastapi.responses import StreamingResponse
import csv
import io


@router.get("/export")
def export_deals_csv(payload: dict = Depends(admin_user), db: Session = Depends(get_db)):
    deals = (
        db.query(Deal)
        .join(StartupProfile, Deal.startupId == StartupProfile.id)
        .order_by(Deal.createdAt.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Company", "Deal Title", "Stage", "Target Amount", "Currency", "Status", "Analyst", "Matches", "Diligence Items", "Created"])

    for d in deals:
        writer.writerow([
            d.startup.companyName,
            d.title,
            STAGE_LABELS.get(d.stage, d.stage),
            d.targetAmount,
            d.currency,
            d.status,
            d.analyst.email if d.analyst else "",
            len(d.matches),
            len(d.diligence),
            d.createdAt.isoformat() if d.createdAt else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=venturebridge_deals.csv"},
    )

