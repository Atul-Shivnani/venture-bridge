import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(s);
}

/**
 * Returns the verified JWT payload for the current request, or null if invalid.
 * Safe to call in any server component — never throws.
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("vb_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    const portalName = process.env.PORTAL_NAME;
    if (!portalName || payload.portal !== portalName) return null;
    return payload; // { sub, email, portal, role, approved }
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session || session.approved !== true) {
    redirect(`${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"}/signin`);
  }
  return session;
}
