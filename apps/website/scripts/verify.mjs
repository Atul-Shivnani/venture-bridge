/**
 * Verify script — hits every major API endpoint and reports pass/fail.
 *
 * Usage (from apps/website, with ALL services running):
 *   node scripts/verify.mjs
 *
 * Requires:
 *   - Next.js website running on localhost:3000
 *   - startup-api    on localhost:8002
 *   - investor-api   on localhost:8001
 *   - admin-api      on localhost:8003
 *   - Database seeded (run seed.mjs first)
 */

const WEBSITE_URL   = "http://localhost:3000";
const STARTUP_URL   = "http://localhost:8002";
const INVESTOR_URL  = "http://localhost:8001";
const ADMIN_URL     = "http://localhost:8003";

const USERS = {
  startup:  { email: "maya@techflow.ai",        password: "password123" },
  investor: { email: "fund@alphaventures.com",   password: "password123" },
  admin:    { email: "admin@venturebridge.com",  password: "admin123"    },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

let pass = 0, fail = 0;
const results = [];

function log(label, ok, detail = "") {
  const icon = ok ? "✅" : "❌";
  results.push({ icon, label, detail });
  if (ok) pass++; else fail++;
}

async function getToken(role) {
  try {
    const res = await fetch(`${WEBSITE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(USERS[role]),
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token;
  } catch {
    return null;
  }
}

async function check(label, url, token, { method = "GET", body } = {}) {
  try {
    const opts = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };
    const res = await fetch(url, opts);
    const ok = res.status < 400;
    let data;
    try { data = await res.json(); } catch { data = {}; }
    log(label, ok, ok ? `HTTP ${res.status}` : `HTTP ${res.status} — ${JSON.stringify(data).slice(0, 80)}`);
    return { ok, data };
  } catch (e) {
    log(label, false, `Connection refused — is the service running?`);
    return { ok: false, data: null };
  }
}

async function checkHealth(label, url) {
  try {
    const res = await fetch(`${url}/health`);
    const ok = res.ok;
    log(label, ok, ok ? "Service reachable" : `HTTP ${res.status}`);
    return ok;
  } catch {
    log(label, false, "Connection refused — service not running");
    return false;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍  VentureBridge — API verification\n");

  // ── 1. Health checks ───────────────────────────────────────────────────────
  console.log("── Health checks ──────────────────────────────────────────────");
  await checkHealth("startup-api  health", STARTUP_URL);
  await checkHealth("investor-api health", INVESTOR_URL);
  await checkHealth("admin-api    health", ADMIN_URL);

  // ── 2. Auth ────────────────────────────────────────────────────────────────
  console.log("\n── Auth (website login) ───────────────────────────────────────");

  const startupToken   = await getToken("startup");
  const investorToken  = await getToken("investor");
  const adminToken     = await getToken("admin");

  log("Login → startup  (maya@techflow.ai)",       !!startupToken,  startupToken  ? "Token issued" : "Login failed — run seed.mjs first");
  log("Login → investor (fund@alphaventures.com)",  !!investorToken, investorToken ? "Token issued" : "Login failed — run seed.mjs first");
  log("Login → admin    (admin@venturebridge.com)", !!adminToken,    adminToken    ? "Token issued" : "Login failed — create admin first");

  // ── 3. Startup API ─────────────────────────────────────────────────────────
  console.log("\n── Startup API ────────────────────────────────────────────────");
  if (startupToken) {
    const { data: dash }  = await check("GET /dashboard",                  `${STARTUP_URL}/dashboard`,             startupToken);
    log("  dashboard.kpis present",   !!dash?.kpis,   dash?.kpis ? "ok" : "kpis missing");
    log("  dashboard.pipeline array", Array.isArray(dash?.pipeline), "");

    const { data: pipe }  = await check("GET /pipeline",                   `${STARTUP_URL}/pipeline`,              startupToken);
    log("  pipeline.groups present",  !!pipe?.groups, "");

    const { data: tasks } = await check("GET /tasks",                      `${STARTUP_URL}/tasks`,                 startupToken);
    log("  tasks.items array",        Array.isArray(tasks?.items),  "");
    log("  tasks.deals array",        Array.isArray(tasks?.deals),  "");
    log("  tasks.counts present",     !!tasks?.counts, "");

    await check("GET /investors",                                           `${STARTUP_URL}/investors`,             startupToken);
    await check("GET /documents",                                           `${STARTUP_URL}/documents`,             startupToken);
    await check("GET /profile",                                             `${STARTUP_URL}/profile`,               startupToken);
    await check("GET /settings",                                            `${STARTUP_URL}/settings`,              startupToken);

    // Create task
    const { ok: taskOk, data: newTask } = await check(
      "POST /tasks (create)",
      `${STARTUP_URL}/tasks`,
      startupToken,
      { method: "POST", body: { category: "financial", title: "Verify script test task" } }
    );
    if (taskOk && newTask?.item?.id) {
      await check(
        "PUT /tasks/{id}/status → complete",
        `${STARTUP_URL}/tasks/${newTask.item.id}/status`,
        startupToken,
        { method: "PUT", body: { status: "complete" } }
      );
    }

    // Create deal
    const { ok: dealOk, data: newDeal } = await check(
      "POST /pipeline (create deal)",
      `${STARTUP_URL}/pipeline`,
      startupToken,
      { method: "POST", body: { title: "Verify Script Test Deal", stage: "seed", targetAmount: 1_000_000 } }
    );
  } else {
    log("Startup API checks skipped", false, "No token");
  }

  // ── 4. Investor API ────────────────────────────────────────────────────────
  console.log("\n── Investor API ───────────────────────────────────────────────");
  if (investorToken) {
    const { data: dash } = await check("GET /dashboard",  `${INVESTOR_URL}/dashboard`,  investorToken);
    log("  dashboard.kpis present",  !!dash?.kpis, "");
    log("  dashboard.topMatches",    Array.isArray(dash?.topMatches), "");

    const { data: df }   = await check("GET /dealflow",   `${INVESTOR_URL}/dealflow`,   investorToken);
    log("  dealflow.matches array",  Array.isArray(df?.matches), "");

    const { data: dil }  = await check("GET /diligence",  `${INVESTOR_URL}/diligence`,  investorToken);
    log("  diligence.items array",   Array.isArray(dil?.items), "");

    // Update diligence status if items exist
    if (dil?.items?.length > 0) {
      const id = dil.items[0].id;
      const cur = dil.items[0].status;
      const next = cur === "pending" ? "in_progress" : "pending";
      await check(
        `PUT /diligence/{id}/status → ${next}`,
        `${INVESTOR_URL}/diligence/${id}/status`,
        investorToken,
        { method: "PUT", body: { status: next } }
      );
    } else {
      log("PUT /diligence/{id}/status", true, "skipped — no items to update");
    }

    await check("GET /watchlist",  `${INVESTOR_URL}/watchlist`,  investorToken);
    await check("GET /portfolio",  `${INVESTOR_URL}/portfolio`,  investorToken);
    await check("GET /profile",    `${INVESTOR_URL}/profile`,    investorToken);
    await check("GET /settings",   `${INVESTOR_URL}/settings`,   investorToken);

    // Update a dealflow match status if available
    if (df?.matches?.length > 0) {
      const matchId = df.matches[0].id;
      await check(
        "PUT /dealflow/{id}/status → interested",
        `${INVESTOR_URL}/dealflow/${matchId}`,
        investorToken,
        { method: "PUT", body: { status: "interested" } }
      );
    } else {
      log("PUT /dealflow/{id}/status", true, "skipped — no matches yet (run matching from admin)");
    }
  } else {
    log("Investor API checks skipped", false, "No token");
  }

  // ── 5. Admin API ───────────────────────────────────────────────────────────
  console.log("\n── Admin API ──────────────────────────────────────────────────");
  if (adminToken) {
    const { data: dash } = await check("GET /dashboard",    `${ADMIN_URL}/dashboard`,    adminToken);
    log("  dashboard.kpis present", !!dash?.kpis, "");

    const { data: app }  = await check("GET /approvals",    `${ADMIN_URL}/approvals`,    adminToken);
    log("  approvals.pending array", Array.isArray(app?.pending), "");
    log("  pending@newvc.com in queue", app?.pending?.some(u => u.email === "pending@newvc.com"), "");

    const { data: deals } = await check("GET /deals",       `${ADMIN_URL}/deals`,        adminToken);
    log("  deals.deals array",  Array.isArray(deals?.deals), "");

    await check("GET /analysts",   `${ADMIN_URL}/analysts`,   adminToken);
    await check("GET /compliance", `${ADMIN_URL}/compliance`, adminToken);
    await check("GET /profile",    `${ADMIN_URL}/profile`,    adminToken);

    // Run matching on first deal if available
    if (deals?.deals?.length > 0) {
      const dealId = deals.deals[0].id;
      const { data: matchResult } = await check(
        `POST /deals/${dealId}/match`,
        `${ADMIN_URL}/deals/${dealId}/match`,
        adminToken,
        { method: "POST" }
      );
      if (matchResult) {
        log(
          `  matching result`,
          matchResult.success === true,
          `${matchResult.matchesCreated ?? 0} new, ${matchResult.skippedExisting ?? 0} existing skipped`
        );
      }
    }

    // Approve the pending investor
    const pendingUser = app?.pending?.find(u => u.email === "pending@newvc.com");
    if (pendingUser) {
      await check(
        "POST /approvals/{id}/approve (pending@newvc.com)",
        `${ADMIN_URL}/approvals/${pendingUser.id}/approve`,
        adminToken,
        { method: "POST" }
      );
    } else {
      log("POST /approvals/{id}/approve", true, "skipped — pending@newvc.com not in queue (already approved?)");
    }
  } else {
    log("Admin API checks skipped", false, "No token");
  }

  // ── Results ────────────────────────────────────────────────────────────────
  console.log("\n── Results ────────────────────────────────────────────────────\n");
  for (const r of results) {
    const detail = r.detail ? `  ${r.detail}` : "";
    console.log(`  ${r.icon}  ${r.label}${detail}`);
  }

  const total = pass + fail;
  console.log(`\n  ${pass}/${total} passed${fail > 0 ? ` · ${fail} failed` : ""}`);

  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error("❌ ", e.message); process.exit(1); });
