/**
 * Seed script — populates the database with realistic mock data covering all features.
 *
 * Usage (from apps/website):
 *   node scripts/seed.mjs
 *
 * Safe to re-run: skips records whose email already exists.
 * Run AFTER: npx prisma db push (to apply latest schema changes)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = "password123";   // all seed users share this password

// ── Helpers ─────────────────────────────────────────────────────────────────

async function hash(pw) {
  return bcrypt.hash(pw, 12);
}

function cuid() {
  // Simple cuid-like id for seeded records
  return "seed_" + Math.random().toString(36).slice(2, 18) + Date.now().toString(36);
}

let created = { users: 0, deals: 0, matches: 0, diligence: 0, documents: 0 };
let skipped = 0;

async function findOrCreateUser(data, profileData) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    skipped++;
    return { user: existing, isNew: false };
  }
  const passwordHash = await hash(PASSWORD);
  const user = await prisma.user.create({ data: { ...data, passwordHash } });
  created.users++;

  if (profileData && data.portal === "startup") {
    await prisma.startupProfile.create({ data: { userId: user.id, ...profileData } });
  }
  if (profileData && data.portal === "investor") {
    await prisma.investorProfile.create({ data: { userId: user.id, ...profileData } });
  }
  return { user, isNew: true };
}

// ── Seed data ────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  VentureBridge seed starting…\n");

  // ── Startups ──────────────────────────────────────────────────────────────

  const { user: u1 } = await findOrCreateUser(
    { email: "maya@techflow.ai",       portal: "startup", role: "user", approved: true },
    {
      companyName: "TechFlow AI",  sector: "FinTech",    subSector: "AI Lending",
      country: "India",            fundingStage: "seed", foundedYear: 2021,
      teamSize: 18,                website: "https://techflow.ai",
      description: "AI-powered credit underwriting for MSME lenders in emerging markets.",
      businessModel: "SaaS",       customersServed: "B2B",
      amountRaising: 2_000_000,    instrumentType: "Equity",
      useOfFunds: "Product, Sales, Compliance",
      arr: 320_000,
    }
  );

  const { user: u2 } = await findOrCreateUser(
    { email: "raj@greenenergy.com",    portal: "startup", role: "user", approved: true },
    {
      companyName: "GreenEnergy Solutions", sector: "CleanTech", subSector: "Solar",
      country: "Singapore",               fundingStage: "series_a",
      foundedYear: 2019,                  teamSize: 42,
      website: "https://greenenergy.com",
      description: "Rooftop solar-as-a-service across Southeast Asia.",
      businessModel: "Subscription",      customersServed: "B2B + B2C",
      amountRaising: 5_000_000,           instrumentType: "Equity",
      useOfFunds: "Expansion into Vietnam and Thailand, hardware procurement",
      arr: 1_200_000,
    }
  );

  const { user: u3 } = await findOrCreateUser(
    { email: "priya@crediweave.com",   portal: "startup", role: "user", approved: true },
    {
      companyName: "CrediWeave",   sector: "FinTech",      subSector: "Credit Infrastructure",
      country: "India",            fundingStage: "pre_seed", foundedYear: 2023,
      teamSize: 6,                 website: "https://crediweave.com",
      description: "Embedded credit scoring API for neo-banks and fintechs.",
      businessModel: "API + Usage",customersServed: "B2B",
      amountRaising: 500_000,      instrumentType: "SAFE",
      useOfFunds: "MVP, early customer pilots, regulatory sandbox",
      arr: 0,
    }
  );

  // ── Investors (approved) ──────────────────────────────────────────────────

  const { user: inv1 } = await findOrCreateUser(
    { email: "fund@alphaventures.com", portal: "investor", role: "user", approved: true },
    {
      firmName: "Alpha Ventures",   investorType: "vc",
      ticketSizeLabel: "$500k – $5M",
      ticketMin: 500_000,           ticketMax: 5_000_000,
      geographies: ["India", "Southeast Asia"],
      sectors: ["FinTech", "SaaS", "AI"],
      stagesAllowed: ["pre_seed", "seed", "series_a"],
      instrumentTypesAllowed: ["Equity", "SAFE"],
      revenueFloor: null,           profitabilityPreference: "pre-revenue-ok",
      esgExclusions: ["Tobacco", "Weapons"],
      regulatoryExclusions: [],
    }
  );

  const { user: inv2 } = await findOrCreateUser(
    { email: "deals@seacapital.com",   portal: "investor", role: "user", approved: true },
    {
      firmName: "SEA Capital",      investorType: "family_office",
      ticketSizeLabel: "$1M – $10M",
      ticketMin: 1_000_000,         ticketMax: 10_000_000,
      geographies: ["Southeast Asia", "India", "Singapore"],
      sectors: ["CleanTech", "FinTech", "AgriTech"],
      stagesAllowed: ["seed", "series_a", "series_b"],
      instrumentTypesAllowed: ["Equity"],
      revenueFloor: 200_000,        profitabilityPreference: "path-to-profitability",
      esgExclusions: ["Fossil Fuels"],
      regulatoryExclusions: ["Crypto"],
    }
  );

  const { user: inv3 } = await findOrCreateUser(
    { email: "green@greenfund.io",     portal: "investor", role: "user", approved: true },
    {
      firmName: "GreenFund Partners",  investorType: "vc",
      ticketSizeLabel: "$2M – $20M",
      ticketMin: 2_000_000,            ticketMax: 20_000_000,
      geographies: ["India", "Singapore", "Southeast Asia"],
      sectors: ["CleanTech", "SaaS"],
      stagesAllowed: ["series_a", "series_b", "growth"],
      instrumentTypesAllowed: ["Equity"],
      revenueFloor: 500_000,           profitabilityPreference: "path-to-profitability",
      esgExclusions: [],
      regulatoryExclusions: [],
    }
  );

  // ── Investor (pending approval) ───────────────────────────────────────────

  await findOrCreateUser(
    { email: "pending@newvc.com",      portal: "investor", role: "user", approved: false },
    {
      firmName: "NewVC Fund",       investorType: "vc",
      ticketSizeLabel: "$250k – $2M",
      ticketMin: 250_000,           ticketMax: 2_000_000,
      geographies: ["India"],
      sectors: ["FinTech"],
      stagesAllowed: ["pre_seed", "seed"],
      instrumentTypesAllowed: ["SAFE", "Equity"],
      revenueFloor: null,           profitabilityPreference: "pre-revenue-ok",
      esgExclusions: [],            regulatoryExclusions: [],
    }
  );

  // ── Deals ─────────────────────────────────────────────────────────────────

  async function findOrCreateDeal(startupUserId, dealData) {
    const profile = await prisma.startupProfile.findUnique({ where: { userId: startupUserId } });
    if (!profile) return null;
    const existing = await prisma.deal.findFirst({
      where: { startupId: profile.id, title: dealData.title }
    });
    if (existing) return existing;
    const deal = await prisma.deal.create({ data: { id: cuid(), startupId: profile.id, ...dealData } });
    created.deals++;
    return deal;
  }

  const deal1 = await findOrCreateDeal(u1.id, {
    title: "Series A Raise",  stage: "seed",    targetAmount: 2_000_000,
    currency: "USD",          status: "live",   updatedAt: new Date(),  createdAt: new Date(),
  });

  const deal2 = await findOrCreateDeal(u2.id, {
    title: "Series A Round",  stage: "series_a", targetAmount: 5_000_000,
    currency: "USD",          status: "live",    updatedAt: new Date(), createdAt: new Date(),
  });

  const deal3 = await findOrCreateDeal(u3.id, {
    title: "Pre-seed Round",  stage: "pre_seed", targetAmount: 500_000,
    currency: "USD",          status: "under_review", updatedAt: new Date(), createdAt: new Date(),
  });

  // ── Deal Matches ──────────────────────────────────────────────────────────

  const invProfile1 = await prisma.investorProfile.findUnique({ where: { userId: inv1.id } });
  const invProfile2 = await prisma.investorProfile.findUnique({ where: { userId: inv2.id } });
  const invProfile3 = await prisma.investorProfile.findUnique({ where: { userId: inv3.id } });

  async function findOrCreateMatch(dealId, investorId, matchScore, status) {
    if (!dealId || !investorId) return;
    const existing = await prisma.dealMatch.findFirst({ where: { dealId, investorId } });
    if (existing) return existing;
    const m = await prisma.dealMatch.create({
      data: { id: cuid(), dealId, investorId, matchScore, status, createdAt: new Date(), updatedAt: new Date() }
    });
    created.matches++;
    return m;
  }

  const m1 = await findOrCreateMatch(deal1?.id, invProfile1?.id, 85, "interested");     // TechFlow + Alpha
  const m2 = await findOrCreateMatch(deal1?.id, invProfile2?.id, 55, "pending");        // TechFlow + SEA Capital
  const m3 = await findOrCreateMatch(deal2?.id, invProfile2?.id, 80, "in_diligence");   // GreenEnergy + SEA Capital
  const m4 = await findOrCreateMatch(deal2?.id, invProfile3?.id, 90, "term_sheet");     // GreenEnergy + GreenFund
  const m5 = await findOrCreateMatch(deal3?.id, invProfile1?.id, 70, "interested");     // CrediWeave + Alpha

  // ── Diligence Items ───────────────────────────────────────────────────────

  async function findOrCreateDiligence({ dealId, investorId, ...rest }) {
    const existing = await prisma.diligenceItem.findFirst({
      where: { dealId, title: rest.title }
    });
    if (existing) return existing;
    const item = await prisma.diligenceItem.create({
      data: {
        deal:     { connect: { id: dealId } },
        ...(investorId ? { investor: { connect: { id: investorId } } } : {}),
        ...rest,
      }
    });
    created.diligence++;
    return item;
  }

  // Investor-assigned items
  if (deal1 && invProfile1) {
    await findOrCreateDiligence({
      dealId: deal1.id, investorId: invProfile1.id,
      category: "financial", title: "Audited Financial Statements FY2023",
      notes: "Please share CA-certified P&L and balance sheet for the last 2 fiscal years.",
      status: "in_progress", createdAt: new Date(), updatedAt: new Date(),
    });
    await findOrCreateDiligence({
      dealId: deal1.id, investorId: invProfile1.id,
      category: "legal", title: "Cap Table and ESOP Schedule",
      notes: "Full cap table including any outstanding convertible instruments.",
      status: "pending", createdAt: new Date(), updatedAt: new Date(),
    });
  }

  if (deal2 && invProfile2) {
    await findOrCreateDiligence({
      dealId: deal2.id, investorId: invProfile2.id,
      category: "market", title: "Market Size Validation — Vietnam & Thailand",
      notes: "TAM/SAM/SOM analysis for target expansion markets.",
      status: "pending", createdAt: new Date(), updatedAt: new Date(),
    });
    await findOrCreateDiligence({
      dealId: deal2.id, investorId: invProfile2.id,
      category: "team", title: "Founder Background Verification",
      notes: "KYC documents and LinkedIn verification for all co-founders.",
      status: "flagged", createdAt: new Date(), updatedAt: new Date(),
    });
  }

  if (deal2 && invProfile3) {
    await findOrCreateDiligence({
      dealId: deal2.id, investorId: invProfile3.id,
      category: "governance", title: "Board Composition and Minutes",
      notes: "Last 4 board meeting minutes and current governance structure.",
      status: "pending", createdAt: new Date(), updatedAt: new Date(),
    });
  }

  // Startup self-created tasks (no investorId)
  if (deal1) {
    await findOrCreateDiligence({
      dealId: deal1.id, investorId: null,
      category: "financial", title: "Update financial model with Q4 2024 actuals",
      notes: "Investor data rooms need the latest MRR and burn rate figures.",
      status: "in_progress", createdAt: new Date(), updatedAt: new Date(),
    });
  }
  if (deal2) {
    await findOrCreateDiligence({
      dealId: deal2.id, investorId: null,
      category: "legal", title: "Prepare regulatory compliance documentation",
      notes: "MAS sandbox application and PDPA compliance checklist.",
      status: "pending", createdAt: new Date(), updatedAt: new Date(),
    });
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  async function findOrCreateDocument(startupUserId, dealId, data) {
    const profile = await prisma.startupProfile.findUnique({ where: { userId: startupUserId } });
    if (!profile) return;
    const existing = await prisma.document.findFirst({
      where: { startupId: profile.id, filename: data.filename }
    });
    if (existing) return existing;
    await prisma.document.create({
      data: {
        id: cuid(),
        startupId: profile.id,
        dealId: dealId ?? null,
        uploadedById: startupUserId,
        ...data,
        createdAt: new Date(),
      }
    });
    created.documents++;
  }

  await findOrCreateDocument(u1.id, deal1?.id, {
    type: "pitch_deck",      filename: "TechFlow_Series_A_Deck_2024.pdf",
    url: "https://drive.google.com/mock/techflow-deck",  status: "approved",
  });
  await findOrCreateDocument(u1.id, deal1?.id, {
    type: "financial_model", filename: "TechFlow_Financials_Q3_2024.xlsx",
    url: "https://drive.google.com/mock/techflow-financials", status: "pending",
  });
  await findOrCreateDocument(u2.id, deal2?.id, {
    type: "pitch_deck",      filename: "GreenEnergy_Pitch_Deck_v3.pdf",
    url: "https://drive.google.com/mock/greenenergy-deck",    status: "approved",
  });
  await findOrCreateDocument(u2.id, deal2?.id, {
    type: "cap_table",       filename: "GreenEnergy_CapTable_Nov24.xlsx",
    url: "https://drive.google.com/mock/greenenergy-captable", status: "flagged",
  });
  await findOrCreateDocument(u3.id, deal3?.id, {
    type: "pitch_deck",      filename: "CrediWeave_PreSeed_Deck.pdf",
    url: "https://drive.google.com/mock/crediweave-deck",     status: "pending",
  });

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log("✅  Seed complete!\n");
  console.log("  Created:");
  console.log(`    Users      : ${created.users}`);
  console.log(`    Deals      : ${created.deals}`);
  console.log(`    Matches    : ${created.matches}`);
  console.log(`    Diligence  : ${created.diligence}`);
  console.log(`    Documents  : ${created.documents}`);
  if (skipped > 0) console.log(`\n  Skipped (already existed): ${skipped} user(s)`);

  console.log("\n  Login credentials (all use password: password123)");
  console.log("  ┌─────────────────────────────────────┬──────────────┬──────────┐");
  console.log("  │ Email                               │ Portal       │ Status   │");
  console.log("  ├─────────────────────────────────────┼──────────────┼──────────┤");
  console.log("  │ admin@venturebridge.com             │ admin        │ approved │");
  console.log("  │ maya@techflow.ai                    │ startup      │ approved │");
  console.log("  │ raj@greenenergy.com                 │ startup      │ approved │");
  console.log("  │ priya@crediweave.com                │ startup      │ approved │");
  console.log("  │ fund@alphaventures.com              │ investor     │ approved │");
  console.log("  │ deals@seacapital.com                │ investor     │ approved │");
  console.log("  │ green@greenfund.io                  │ investor     │ approved │");
  console.log("  │ pending@newvc.com                   │ investor     │ PENDING  │");
  console.log("  └─────────────────────────────────────┴──────────────┴──────────┘");
  console.log("\n  Admin password: admin123");
}

main()
  .catch((e) => { console.error("❌ ", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
