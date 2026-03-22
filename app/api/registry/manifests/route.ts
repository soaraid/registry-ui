import { NextResponse } from "next/server";

import { getManifestSummary } from "@/lib/docker-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repository = searchParams.get("repository");
    const reference = searchParams.get("reference");

    if (!repository || !reference) {
      return NextResponse.json(
        {
          error: 'Missing required "repository" or "reference" query parameter.',
        },
        {
          status: 400,
        },
      );
    }

    const manifest = await getManifestSummary(repository, reference);

    return NextResponse.json(manifest);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch manifest summary.";

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

