"use client";

import { useQuery } from "@tanstack/react-query";

import type { RegistryHealthReport } from "@/lib/docker-api";

async function fetchRegistryHealth() {
  const response = await fetch("/api/registry/health", {
    cache: "no-store",
  });
  const payload = (await response.json()) as RegistryHealthReport & { error?: string };

  if (!response.ok && !payload.reachable) {
    return payload;
  }

  return payload;
}

export function useRegistryHealth() {
  return useQuery({
    queryKey: ["registry", "health"],
    queryFn: fetchRegistryHealth,
    staleTime: 30_000,
    retry: 0,
  });
}

