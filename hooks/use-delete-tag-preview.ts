"use client";

import { useQuery } from "@tanstack/react-query";

import type { DeleteTagPreview } from "@/lib/docker-api";
import { buildTagApiPath } from "@/lib/paths";

async function fetchDeleteTagPreview(repository: string, tag: string) {
  const response = await fetch(buildTagApiPath(repository, tag), {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to inspect delete impact.");
  }

  return (await response.json()) as DeleteTagPreview;
}

export function useDeleteTagPreview(repository: string, tag: string, enabled: boolean) {
  return useQuery({
    queryKey: ["registry", "repository", repository, "delete-preview", tag],
    queryFn: () => fetchDeleteTagPreview(repository, tag),
    enabled,
    staleTime: 60_000,
  });
}
