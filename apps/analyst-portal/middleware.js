import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/signin"];
const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("vb_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`, request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.portal !== "analyst") {
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
