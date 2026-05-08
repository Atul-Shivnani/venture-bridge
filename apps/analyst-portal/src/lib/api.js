import { cookies } from "next/headers";

const API_BASE = process.env.ANALYST_API_URL || "http://localhost:8004";

export async function apiGet(path) {
  const cookieStore = await cookies();
  const token = cookieStore.get("vb_token")?.value;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[analyst-api] ${path} → HTTP ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[analyst-api] ${path} failed:`, err?.message ?? err);
    return null;
  }
}

export async function apiPost(path, body) {
  const cookieStore = await cookies();
  const token = cookieStore.get("vb_token")?.value;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[analyst-api] POST ${path} → HTTP ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[analyst-api] POST ${path} failed:`, err?.message ?? err);
    return null;
  }
}
