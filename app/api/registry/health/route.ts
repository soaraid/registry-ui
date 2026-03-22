import { NextResponse } from "next/server";

import { getRegistryHealthReport } from "@/lib/docker-api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const health = await getRegistryHealthReport();

    return NextResponse.json(health, {
      status: health.reachable ? 200 : 503,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run registry health check.";

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

