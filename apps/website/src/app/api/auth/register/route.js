import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

const ALLOWED_PORTALS = new Set(["startup", "investor", "admin"]);

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "").trim();
    const portal = String(body.portal || "").toLowerCase().trim();

    if (!email || !password || !ALLOWED_PORTALS.has(portal)) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const approved = portal === "startup";

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        portal,
        approved,
        role: "user",
      },
    });

    const token = await signToken({
      sub: user.id,
      email: user.email,
      portal: user.portal,
      role: user.role,
      approved: user.approved,
    });

    return NextResponse.json({
      token,
      portal: user.portal,
      approved: user.approved,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
