"use client";

import { useQuery } from "@tanstack/react-query";

import { buildTagsApiPath } from "@/lib/paths";

export interface RepositoryTagsPayload {
  repository: string;
  count: number;
  tags: string[];
}

async function fetchRepositoryTags(repository: string) {
  const response = await fetch(buildTagsApiPath(repository), {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to load repository tags.");
  }

  return (await response.json()) as RepositoryTagsPayload;
}

export function useRepositoryTags(repository: string, enabled = true) {
  return useQuery({
    queryKey: ["registry", "repository", repository, "tags"],
    queryFn: () => fetchRepositoryTags(repository),
    staleTime: 15_000,
    enabled,
  });
}
