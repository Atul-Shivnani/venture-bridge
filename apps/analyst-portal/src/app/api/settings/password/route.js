import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.ANALYST_API_URL || "http://localhost:8004";

export async function PUT(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("vb_token")?.value;

  const body = await request.json();

  try {
    const res = await fetch(`${API_BASE}/settings/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ detail: "Upstream error: " + (err?.message ?? err) }, { status: 502 });
  }
}
