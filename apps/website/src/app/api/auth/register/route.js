import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

const ALLOWED_PORTALS = new Set(["startup", "investor"]);

// Map registration form funding stage values (with dashes) → Prisma enum (underscores)
const STAGE_MAP = {
  idea: "idea",
  "pre-seed": "pre_seed",
  seed: "seed",
  "series-a": "series_a",
  "series-b": "series_b",
  growth: "growth",
};

// Map registration form investor type values → Prisma enum
const INVESTOR_TYPE_MAP = {
  vc: "vc",
  angel: "angel",
  "family-office": "family_office",
  "corporate-vc": "corporate_vc",
  bank: "bank",
  other: "other",
};

// Parse a ticket size label like "$250k – $2M" into { min, max } floats (best-effort)
function parseTicketSize(label) {
  const toNumber = (s) => {
    const n = parseFloat(s.replace(/[^0-9.]/g, ""));
    if (isNaN(n)) return null;
    const lower = s.toLowerCase();
    if (lower.includes("b")) return n * 1_000_000_000;
    if (lower.includes("m")) return n * 1_000_000;
    if (lower.includes("k")) return n * 1_000;
    return n;
  };
  const parts = label.split(/[-–—]/);
  const min = parts[0] ? toNumber(parts[0].trim()) : null;
  const max = parts[1] ? toNumber(parts[1].trim()) : null;
  return { ticketMin: min, ticketMax: max };
}

// Parse a comma-separated string → JSON array
function parseList(str) {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "").trim();
    const portal = String(body.portal || "").toLowerCase().trim();
    const details = body.details || {};

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email || !password || !ALLOWED_PORTALS.has(portal)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (portal === "startup") {
      if (!details.companyName || !details.sector || !details.country || !details.stage) {
        return NextResponse.json({ error: "Missing startup details" }, { status: 400 });
      }
      if (!STAGE_MAP[details.stage]) {
        return NextResponse.json({ error: "Invalid funding stage" }, { status: 400 });
      }
    }

    if (portal === "investor") {
      if (!details.firmName || !details.investorType || !details.ticketSize || !details.geography) {
        return NextResponse.json({ error: "Missing investor details" }, { status: 400 });
      }
      if (!INVESTOR_TYPE_MAP[details.investorType]) {
        return NextResponse.json({ error: "Invalid investor type" }, { status: 400 });
      }
    }

    // ── Duplicate check ─────────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // ── Create user + profile in a single transaction ────────────────────────
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          portal,
          role: "user",
          // Startups are auto-approved; investors require admin review
          approved: portal === "startup",
        },
      });

      if (portal === "startup") {
        await tx.startupProfile.create({
          data: {
            userId: newUser.id,
            companyName: details.companyName,
            sector: details.sector,
            subSector: details.subSector || null,
            country: details.country,
            fundingStage: STAGE_MAP[details.stage],
            foundedYear: details.foundedYear ? parseInt(details.foundedYear, 10) || null : null,
            teamSize: details.teamSize ? parseInt(details.teamSize, 10) || null : null,
            website: details.website || null,
            description: details.description || null,
            businessModel: details.businessModel || null,
            customersServed: details.customersServed || null,
            amountRaising: details.amountRaising ? parseFloat(details.amountRaising) || null : null,
            instrumentType: details.instrumentType || null,
            useOfFunds: details.useOfFunds || null,
          },
        });
      }

      if (portal === "investor") {
        const { ticketMin, ticketMax } = parseTicketSize(details.ticketSize);
        await tx.investorProfile.create({
          data: {
            userId: newUser.id,
            firmName: details.firmName,
            investorType: INVESTOR_TYPE_MAP[details.investorType],
            ticketSizeLabel: details.ticketSize,
            ticketMin,
            ticketMax,
            geographies: parseList(details.geography),
            sectors: details.sectors ? parseList(details.sectors) : [],
            stagesAllowed: details.stagesAllowed ? parseList(details.stagesAllowed) : [],
            instrumentTypesAllowed: details.instrumentTypesAllowed
              ? parseList(details.instrumentTypesAllowed)
              : [],
            revenueFloor: details.revenueFloor ? parseFloat(details.revenueFloor) || null : null,
            profitabilityPreference: details.profitabilityPreference || null,
            esgExclusions: details.esgExclusions ? parseList(details.esgExclusions) : [],
            regulatoryExclusions: details.regulatoryExclusions
              ? parseList(details.regulatoryExclusions)
              : [],
          },
        });
      }

      return newUser;
    });

    const token = await signToken({
      sub: user.id,
      email: user.email,
      portal: user.portal,
      role: user.role,
      approved: user.approved,
    });

    return NextResponse.json({ token, portal: user.portal, approved: user.approved });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
