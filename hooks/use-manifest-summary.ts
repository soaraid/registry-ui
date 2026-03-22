"use client";

import { useQuery } from "@tanstack/react-query";

import type { ManifestSummary } from "@/lib/docker-api";
import { buildManifestApiPath } from "@/lib/paths";

async function fetchManifestSummary(repository: string, reference: string) {
  const response = await fetch(buildManifestApiPath(repository, reference), {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to load manifest.");
  }

  return (await response.json()) as ManifestSummary;
}

export function useManifestSummary(repository: string, reference: string, enabled = true) {
  return useQuery({
    queryKey: ["registry", "repository", repository, "manifest", reference],
    queryFn: () => fetchManifestSummary(repository, reference),
    enabled,
    staleTime: 5 * 60_000,
  });
}

