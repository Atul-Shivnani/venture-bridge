/**
 * One-shot script to create an admin user in the database.
 *
 * Usage (from apps/website):
 *   node scripts/create-admin.mjs
 *
 * Edit the ADMIN_EMAIL and ADMIN_PASSWORD values below before running.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// ── Configure these before running ──────────────────────────────────────────
const ADMIN_EMAIL    = "admin@venturebridge.com";
const ADMIN_PASSWORD = "admin123";
// ────────────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function main() {
  if (ADMIN_PASSWORD.length < 8) {
    console.error("❌  Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.error(`❌  A user with email "${ADMIN_EMAIL}" already exists (portal: ${existing.portal}).`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      email:        ADMIN_EMAIL,
      passwordHash,
      portal:       "admin",
      role:         "admin",
      approved:     true,
    },
  });

  console.log(`✅  Admin created:`);
  console.log(`    ID:     ${user.id}`);
  console.log(`    Email:  ${user.email}`);
  console.log(`    Portal: ${user.portal}`);
  console.log(`    Role:   ${user.role}`);
}

main()
  .catch((e) => { console.error("❌ ", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
