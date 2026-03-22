import { NextResponse } from "next/server";

import { deleteTag, getDeleteTagPreview } from "@/lib/docker-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repository = searchParams.get("repository");
    const tag = searchParams.get("tag");

    if (!repository || !tag) {
      return NextResponse.json(
        {
          error: 'Missing required "repository" or "tag" query parameter.',
        },
        {
          status: 400,
        },
      );
    }

    const preview = await getDeleteTagPreview(repository, tag);

    return NextResponse.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to inspect delete impact.";

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repository = searchParams.get("repository");
    const tag = searchParams.get("tag");
    const confirmed = searchParams.get("confirmed");

    if (!repository || !tag) {
      return NextResponse.json(
        {
          error: 'Missing required "repository" or "tag" query parameter.',
        },
        {
          status: 400,
        },
      );
    }

    if (confirmed !== "true") {
      return NextResponse.json(
        {
          error: 'Delete requires explicit confirmation via "confirmed=true".',
        },
        {
          status: 400,
        },
      );
    }

    const result = await deleteTag(repository, tag);

    return NextResponse.json({
      deleted: true,
      repository,
      tag: result.tag,
      digest: result.digest,
      affectedTags: result.affectedTags,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete tag.";

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
