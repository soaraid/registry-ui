import { NextResponse } from "next/server";

import { executeBulkCleanup } from "@/lib/docker-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | {
          repository?: string;
          keepLast?: number;
          prefix?: string;
          regex?: string;
          confirmed?: boolean;
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

    if (payload?.confirmed !== true) {
      return NextResponse.json(
        {
          error: 'Bulk cleanup requires explicit "confirmed=true".',
        },
        {
          status: 400,
        },
      );
    }

    const result = await executeBulkCleanup(repository, {
      keepLast: payload?.keepLast,
      prefix: payload?.prefix,
      regex: payload?.regex,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to execute bulk cleanup.";

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

