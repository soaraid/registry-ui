import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAppAuthEnabled, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  if (!isAppAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const isAuthenticated = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isAuthenticated) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${pathname}${search}`;

  if (nextPath && nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

