import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/signin"];
const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow signin page (for token handoff)
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("vb_token")?.value;

  // No token - redirect to main website (NOT local signin)
  if (!token) {
    return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`, request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // SECURITY: Only allow admin portal access
    if (payload.portal !== "admin") {
      return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`, request.url));
    }

    // SECURITY: Check for admin role
    if (payload.role !== "admin" && payload.role !== "user") {
      return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`, request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`, request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
