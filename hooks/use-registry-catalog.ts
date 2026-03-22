"use client";

import { useQuery } from "@tanstack/react-query";

import type { RegistryCatalogResponse } from "@/lib/docker-api";

async function fetchCatalog() {
  const response = await fetch("/api/registry/catalog", {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to load catalog.");
  }

  return (await response.json()) as RegistryCatalogResponse;
}

export function useRegistryCatalog() {
  return useQuery({
    queryKey: ["registry", "catalog"],
    queryFn: fetchCatalog,
  });
}

