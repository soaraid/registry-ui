import { NextResponse } from "next/server";

import { getTags } from "@/lib/docker-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repository = searchParams.get("repository");
    const limitParam = searchParams.get("n");
    const last = searchParams.get("last") ?? undefined;
    const limit = limitParam ? Number(limitParam) : undefined;

    if (!repository) {
      return NextResponse.json(
        {
          error: 'Missing required "repository" query parameter.',
        },
        {
          status: 400,
        },
      );
    }

    const payload = await getTags(repository, {
      limit: Number.isFinite(limit) ? limit : undefined,
      last,
    });
    const tags = [...(payload.tags ?? [])].sort((left, right) => left.localeCompare(right));

    return NextResponse.json({
      repository,
      count: tags.length,
      tags,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch repository tags.";

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

