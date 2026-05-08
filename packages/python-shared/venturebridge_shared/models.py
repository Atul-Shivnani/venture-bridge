"""
SQLAlchemy models mirroring the Prisma schema.

Prisma quotes all identifiers in PostgreSQL DDL, so mixed-case names like
"passwordHash" are stored case-sensitively.  We use quoted_name() to tell
SQLAlchemy to quote them in every generated SQL statement.
"""

from sqlalchemy import (
    Column, String, Boolean, DateTime, Float, Integer, JSON, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql.elements import quoted_name

from .database import Base


def qn(name: str) -> str:
    """Return a quoted_name if the identifier contains uppercase letters."""
    if any(c.isupper() for c in name):
        return quoted_name(name, True)
    return name


class User(Base):
    __tablename__ = qn("User")

    id           = Column(qn("id"),           String,  primary_key=True)
    email        = Column(qn("email"),        String,  unique=True)
    passwordHash = Column(qn("passwordHash"), String)
    portal       = Column(qn("portal"),       String)
    role         = Column(qn("role"),         String)
    approved     = Column(qn("approved"),     Boolean,  default=False)
    rejectedAt   = Column(qn("rejectedAt"),   DateTime, nullable=True)
    createdAt    = Column(qn("createdAt"),    DateTime)
    updatedAt    = Column(qn("updatedAt"),    DateTime)

    startupProfile  = relationship("StartupProfile",  back_populates="user", uselist=False)
    investorProfile = relationship("InvestorProfile", back_populates="user", uselist=False)
    assignedDeals   = relationship(
        "Deal",
        foreign_keys="[Deal.analystId]",
        back_populates="analyst",
    )
    assignedItems   = relationship(
        "DiligenceItem",
        foreign_keys="[DiligenceItem.assignedToId]",
        back_populates="assignedTo",
    )


class StartupProfile(Base):
    __tablename__ = qn("StartupProfile")

    id              = Column(qn("id"),              String, primary_key=True)
    userId          = Column(qn("userId"),          String, ForeignKey(quoted_name("User.id", True)), unique=True)
    companyName     = Column(qn("companyName"),     String)
    sector          = Column(qn("sector"),          String)
    subSector       = Column(qn("subSector"),       String, nullable=True)
    country         = Column(qn("country"),         String)
    fundingStage    = Column(qn("fundingStage"),    String)
    foundedYear     = Column(qn("foundedYear"),     Integer, nullable=True)
    teamSize        = Column(qn("teamSize"),        Integer, nullable=True)
    website         = Column(qn("website"),         String, nullable=True)
    description     = Column(qn("description"),    Text,   nullable=True)
    businessModel   = Column(qn("businessModel"),  String, nullable=True)
    customersServed = Column(qn("customersServed"), String, nullable=True)
    amountRaising   = Column(qn("amountRaising"),  Float,  nullable=True)
    instrumentType  = Column(qn("instrumentType"), String, nullable=True)
    useOfFunds      = Column(qn("useOfFunds"),      Text,   nullable=True)
    arr             = Column(qn("arr"),             Float,  nullable=True)
    createdAt       = Column(qn("createdAt"),       DateTime)
    updatedAt       = Column(qn("updatedAt"),       DateTime)

    user  = relationship("User",  back_populates="startupProfile")
    deals = relationship("Deal",  back_populates="startup")


class InvestorProfile(Base):
    __tablename__ = qn("InvestorProfile")

    id                     = Column(qn("id"),                     String, primary_key=True)
    userId                 = Column(qn("userId"),                 String, ForeignKey(quoted_name("User.id", True)), unique=True)
    firmName               = Column(qn("firmName"),               String)
    investorType           = Column(qn("investorType"),           String)
    ticketSizeLabel        = Column(qn("ticketSizeLabel"),        String, nullable=True)
    ticketMin              = Column(qn("ticketMin"),              Float,  nullable=True)
    ticketMax              = Column(qn("ticketMax"),              Float,  nullable=True)
    geographies            = Column(qn("geographies"),            JSON)
    sectors                = Column(qn("sectors"),                JSON,   nullable=True)
    stagesAllowed          = Column(qn("stagesAllowed"),          JSON,   nullable=True)
    instrumentTypesAllowed = Column(qn("instrumentTypesAllowed"), JSON,   nullable=True)
    revenueFloor           = Column(qn("revenueFloor"),           Float,  nullable=True)
    profitabilityPreference = Column(qn("profitabilityPreference"), String, nullable=True)
    esgExclusions          = Column(qn("esgExclusions"),          JSON,   nullable=True)
    regulatoryExclusions   = Column(qn("regulatoryExclusions"),   JSON,   nullable=True)
    createdAt              = Column(qn("createdAt"),              DateTime)
    updatedAt              = Column(qn("updatedAt"),              DateTime)

    user           = relationship("User",          back_populates="investorProfile")
    dealMatches    = relationship("DealMatch",     back_populates="investor")
    diligenceItems = relationship("DiligenceItem", foreign_keys="[DiligenceItem.investorId]", back_populates="investor")


class Deal(Base):
    __tablename__ = qn("Deal")

    id           = Column(qn("id"),           String, primary_key=True)
    startupId    = Column(qn("startupId"),    String, ForeignKey(quoted_name("StartupProfile.id", True)))
    analystId    = Column(qn("analystId"),    String, ForeignKey(quoted_name("User.id", True)),    nullable=True)
    title        = Column(qn("title"),        String)
    stage        = Column(qn("stage"),        String)
    targetAmount = Column(qn("targetAmount"), Float)
    currency     = Column(qn("currency"),     String, default="USD")
    status       = Column(qn("status"),       String, default="draft")
    createdAt    = Column(qn("createdAt"),    DateTime)
    updatedAt    = Column(qn("updatedAt"),    DateTime)

    startup   = relationship("StartupProfile", back_populates="deals")
    analyst   = relationship("User",           foreign_keys=[analystId], back_populates="assignedDeals")
    matches   = relationship("DealMatch",      back_populates="deal")
    diligence = relationship("DiligenceItem",  back_populates="deal")
    notes     = relationship("AnalystNote",    back_populates="deal", order_by="AnalystNote.createdAt")


class DealMatch(Base):
    __tablename__ = qn("DealMatch")

    id         = Column(qn("id"),         String,  primary_key=True)
    dealId     = Column(qn("dealId"),     String,  ForeignKey(quoted_name("Deal.id", True)))
    investorId = Column(qn("investorId"), String,  ForeignKey(quoted_name("InvestorProfile.id", True)))
    matchScore = Column(qn("matchScore"), Integer, default=0)
    status     = Column(qn("status"),    String,  default="pending")
    createdAt  = Column(qn("createdAt"), DateTime)
    updatedAt  = Column(qn("updatedAt"), DateTime)

    deal      = relationship("Deal",            back_populates="matches")
    investor  = relationship("InvestorProfile", back_populates="dealMatches")
    termSheet = relationship("TermSheet",       back_populates="dealMatch", uselist=False)


class DiligenceItem(Base):
    __tablename__ = qn("DiligenceItem")

    id           = Column(qn("id"),           String,  primary_key=True)
    dealId       = Column(qn("dealId"),       String,  ForeignKey(quoted_name("Deal.id", True)))
    investorId   = Column(qn("investorId"),   String,  ForeignKey(quoted_name("InvestorProfile.id", True)), nullable=True)
    assignedToId = Column(qn("assignedToId"), String,  ForeignKey(quoted_name("User.id", True)), nullable=True)
    category     = Column(qn("category"),     String)
    title        = Column(qn("title"),        String)
    notes        = Column(qn("notes"),        Text,    nullable=True)
    status       = Column(qn("status"),       String,  default="pending")
    createdAt    = Column(qn("createdAt"),    DateTime)
    updatedAt    = Column(qn("updatedAt"),    DateTime)

    deal       = relationship("Deal",            back_populates="diligence")
    investor   = relationship("InvestorProfile", foreign_keys=[investorId], back_populates="diligenceItems")
    assignedTo = relationship("User",            foreign_keys=[assignedToId], back_populates="assignedItems")


class Document(Base):
    __tablename__ = qn("Document")

    id           = Column(qn("id"),           String,  primary_key=True)
    startupId    = Column(qn("startupId"),    String,  ForeignKey(quoted_name("StartupProfile.id", True)))
    dealId       = Column(qn("dealId"),       String,  ForeignKey(quoted_name("Deal.id", True)), nullable=True)
    uploadedById = Column(qn("uploadedById"), String,  ForeignKey(quoted_name("User.id", True)))
    type         = Column(qn("type"),         String)
    filename     = Column(qn("filename"),     String)
    url          = Column(qn("url"),          String)
    status       = Column(qn("status"),       String,  default="pending")
    createdAt    = Column(qn("createdAt"),    DateTime)

    startup = relationship("StartupProfile", foreign_keys=[startupId])
    deal    = relationship("Deal",           foreign_keys=[dealId])


class AnalystNote(Base):
    __tablename__ = qn("AnalystNote")

    id        = Column(qn("id"),       String, primary_key=True)
    dealId    = Column(qn("dealId"),   String, ForeignKey(quoted_name("Deal.id", True)))
    authorId  = Column(qn("authorId"), String, ForeignKey(quoted_name("User.id", True)))
    content   = Column(qn("content"),  Text)
    flagType  = Column(qn("flagType"), String)
    createdAt = Column(qn("createdAt"), DateTime)

    deal   = relationship("Deal", back_populates="notes")
    author = relationship("User", foreign_keys=[authorId])


class FinancialAnalysis(Base):
    __tablename__ = qn("FinancialAnalysis")

    id             = Column(qn("id"),             String, primary_key=True)
    dealId         = Column(qn("dealId"),         String, ForeignKey(quoted_name("Deal.id", True)), unique=True)
    analystId      = Column(qn("analystId"),      String, ForeignKey(quoted_name("User.id", True)))
    rawInput       = Column(qn("rawInput"),       Text)

    revenue           = Column(qn("revenue"),          Float,  nullable=True)
    revenueGrowthPct  = Column(qn("revenueGrowthPct"), Float,  nullable=True)
    grossProfit       = Column(qn("grossProfit"),      Float,  nullable=True)
    grossMargin       = Column(qn("grossMargin"),      Float,  nullable=True)
    operatingProfit   = Column(qn("operatingProfit"),  Float,  nullable=True)
    netProfit         = Column(qn("netProfit"),        Float,  nullable=True)
    netMargin         = Column(qn("netMargin"),        Float,  nullable=True)
    ebitda            = Column(qn("ebitda"),           Float,  nullable=True)
    ebitdaMargin      = Column(qn("ebitdaMargin"),     Float,  nullable=True)
    cashOnHand        = Column(qn("cashOnHand"),       Float,  nullable=True)
    totalDebt         = Column(qn("totalDebt"),        Float,  nullable=True)
    totalEquity       = Column(qn("totalEquity"),      Float,  nullable=True)
    debtToEquity      = Column(qn("debtToEquity"),     Float,  nullable=True)
    workingCapital    = Column(qn("workingCapital"),   Float,  nullable=True)
    quickRatio        = Column(qn("quickRatio"),       Float,  nullable=True)
    currentRatio      = Column(qn("currentRatio"),     Float,  nullable=True)
    operatingCashFlow = Column(qn("operatingCashFlow"),Float,  nullable=True)
    burnRate          = Column(qn("burnRate"),         Float,  nullable=True)
    runwayMonths      = Column(qn("runwayMonths"),     Float,  nullable=True)
    aiModel           = Column(qn("aiModel"),          String)
    confidence        = Column(qn("confidence"),       String)
    aiNotes           = Column(qn("aiNotes"),          Text,   nullable=True)
    createdAt         = Column(qn("createdAt"),        DateTime)
    updatedAt         = Column(qn("updatedAt"),        DateTime)

    deal    = relationship("Deal", foreign_keys=[dealId])
    analyst = relationship("User", foreign_keys=[analystId])


class TermSheet(Base):
    __tablename__ = qn("TermSheet")

    id             = Column(qn("id"),             String, primary_key=True)
    dealMatchId    = Column(qn("dealMatchId"),    String, ForeignKey(quoted_name("DealMatch.id", True)), unique=True)
    proposedAmount = Column(qn("proposedAmount"), Float)
    valuation      = Column(qn("valuation"),      Float)
    terms          = Column(qn("terms"),          JSON)
    status         = Column(qn("status"),         String, default="draft")
    createdAt      = Column(qn("createdAt"),      DateTime)
    updatedAt      = Column(qn("updatedAt"),      DateTime)

    dealMatch = relationship("DealMatch", back_populates="termSheet")
