import { NextResponse } from "next/server";

import { getCatalog } from "@/lib/docker-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("n");
    const last = searchParams.get("last") ?? undefined;
    const limit = limitParam ? Number(limitParam) : undefined;

    const catalog = await getCatalog({
      limit: Number.isFinite(limit) ? limit : undefined,
      last,
    });

    return NextResponse.json(catalog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch registry catalog.";

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
