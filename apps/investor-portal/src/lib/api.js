import { cookies } from "next/headers";

const API_BASE = process.env.INVESTOR_API_URL || "http://localhost:8001";

export async function apiGet(path) {
  const cookieStore = await cookies();
  const token = cookieStore.get("vb_token")?.value;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[investor-api] ${path} → HTTP ${res.status}`, body, "token:", token ? "present" : "MISSING");
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[investor-api] ${path} failed:`, err?.message ?? err);
    return null;
  }
}
