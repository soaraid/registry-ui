import { NextResponse } from "next/server";

import {
  createSessionToken,
  isAppAuthEnabled,
  SESSION_COOKIE_NAME,
  validateLoginCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isAppAuthEnabled()) {
      return NextResponse.json(
        {
          error: "App auth is not configured.",
        },
        {
          status: 400,
        },
      );
    }

    const payload = (await request.json().catch(() => null)) as
      | { username?: string; password?: string }
      | null;

    const username = payload?.username?.trim() ?? "";
    const password = payload?.password ?? "";
    const isValid = await validateLoginCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Invalid username or password.",
        },
        {
          status: 401,
        },
      );
    }

    const session = await createSessionToken();
    const response = NextResponse.json({
      authenticated: true,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.maxAge,
      expires: new Date(session.expiresAt),
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}

