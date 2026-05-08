/**
 * Creates a test analyst user.
 * Usage: node scripts/seed-analyst.mjs
 * Reads DATABASE_URL from apps/website/.env
 */

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env manually (no dotenv dependency needed at script level)
function loadEnv(filePath) {
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(resolve(__dirname, "../apps/website/.env"));

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const EMAIL    = "analyst@venturebridge.test";
const PASSWORD = "Analyst123!";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.upsert({
    where:  { email: EMAIL },
    update: { passwordHash: hash, portal: "analyst", approved: true },
    create: {
      email:        EMAIL,
      passwordHash: hash,
      portal:       "analyst",
      role:         "user",
      approved:     true,
    },
  });

  console.log("✓ Analyst user ready:");
  console.log("  email   :", user.email);
  console.log("  password:", PASSWORD);
  console.log("  portal  :", user.portal);
  console.log("  id      :", user.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
