"use client";

import type { ComponentType } from "react";
import { Activity, CircleAlert, RefreshCcw, ServerCog, ShieldCheck, Waypoints } from "lucide-react";

import { useRegistryHealth } from "@/hooks/use-registry-health";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function HealthItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export function RegistryHealthPanel() {
  const healthQuery = useRegistryHealth();
  const health = healthQuery.data;

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardDescription>Live diagnostics</CardDescription>
          <CardTitle>Registry connectivity test</CardTitle>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => healthQuery.refetch()}
          disabled={healthQuery.isFetching}
        >
          <RefreshCcw className={`h-4 w-4 ${healthQuery.isFetching ? "animate-spin" : ""}`} />
          Test connection
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthQuery.isLoading && !health ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : health ? (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge className={health.reachable ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-100"}>
                {health.reachable ? "Registry reachable" : "Registry unreachable"}
              </Badge>
              <Badge variant="outline">
                {health.catalogAccessible ? "Catalog probe passed" : "Catalog probe blocked"}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <HealthItem label="Registry host" value={health.registryHost} icon={ServerCog} />
              <HealthItem label="Auth mode" value={health.authMode} icon={ShieldCheck} />
              <HealthItem label="Response time" value={`${health.responseTimeMs} ms`} icon={Activity} />
              <HealthItem
                label="Last checked"
                value={new Date(health.checkedAt).toLocaleString()}
                icon={Waypoints}
              />
            </div>

            {health.catalogError ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
                Catalog probe warning: {health.catalogError}
              </div>
            ) : null}

            {health.error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-50">
                {health.error}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            No registry diagnostics available yet.
          </div>
        )}

        {healthQuery.isError && !health ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4" />
              Unable to run the registry connectivity test.
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
