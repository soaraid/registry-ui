import { NextResponse } from "next/server";

import { getBulkCleanupPreview } from "@/lib/docker-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | {
          repository?: string;
          keepLast?: number;
          prefix?: string;
          regex?: string;
        }
      | null;

    const repository = payload?.repository?.trim();

    if (!repository) {
      return NextResponse.json(
        {
          error: 'Missing required "repository" value.',
        },
        {
          status: 400,
        },
      );
    }

    const preview = await getBulkCleanupPreview(repository, {
      keepLast: payload?.keepLast,
      prefix: payload?.prefix,
      regex: payload?.regex,
    });

    return NextResponse.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate bulk cleanup preview.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}

