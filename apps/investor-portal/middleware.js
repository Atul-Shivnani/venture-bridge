import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/signin"];
const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`));
  }

  const portalName = process.env.PORTAL_NAME;
  if (!portalName) {
    return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`));
  }

  const token = request.cookies.get("vb_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    if (payload.portal !== portalName) {
      return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`));
    }

    if (payload.approved !== true) {
      return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(`${WEBSITE_URL}/signin`));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
