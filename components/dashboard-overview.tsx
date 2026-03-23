"use client";

import type { AppBrandEnv } from "@/lib/env";
import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight, Boxes, ShieldAlert, ShieldCheck, Waypoints, Wrench } from "lucide-react";

import { useRegistryCatalog } from "@/hooks/use-registry-catalog";
import { useRegistryHealth } from "@/hooks/use-registry-health";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="soft-panel rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

const nextActions = [
  {
    title: "Browse repositories",
    description: "Open the live catalog, search images, and drill into tag detail pages.",
    href: "/repositories",
  },
  {
    title: "Verify registry connection",
    description: "Check reachability, auth mode, and catalog probe status before maintenance.",
    href: "/settings",
  },
  {
    title: "Clean up stale tags safely",
    description: "Use delete preview and bulk cleanup only for singleton-digest candidates.",
    href: "/repositories",
  },
];

export function DashboardOverview({ branding }: { branding: AppBrandEnv }) {
  const catalogQuery = useRegistryCatalog();
  const healthQuery = useRegistryHealth();
  const totalRepositories = catalogQuery.data?.repositories.length ?? 0;
  const health = healthQuery.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden bg-gradient-to-br from-card via-card/75 to-transparent">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="w-fit">{branding.displayName}</Badge>
              <Badge variant="outline">Custom registry dashboard</Badge>
              {health ? (
                <Badge
                  className={
                    health.reachable
                      ? "border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                      : "border-rose-300/60 bg-rose-50 text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100"
                  }
                >
                  {health.reachable ? "Registry reachable" : "Registry unreachable"}
                </Badge>
              ) : null}
            </div>
            <div>
              <CardTitle className="max-w-3xl text-3xl tracking-tight md:text-4xl">Manage your custom registry</CardTitle>
              <CardDescription className="mt-3 max-w-3xl text-base leading-7">
                Browse repositories, inspect manifests, verify connectivity, and clean up tags with safer
                Docker Registry behavior built into the UI.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/repositories" className={cn(buttonVariants(), "gap-2")}>
              Open repositories
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
              Open settings
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {catalogQuery.isLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <SummaryCard label="Repositories" value={String(totalRepositories)} icon={Boxes} />
            )}
          </div>

          {healthQuery.isLoading && !health ? (
            <>
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full sm:col-span-2" />
            </>
          ) : (
            <>
              <SummaryCard
                label="Registry auth"
                value={health?.authMode ?? "Unknown"}
                icon={ShieldCheck}
              />
              <SummaryCard
                label="Catalog probe"
                value={health ? (health.catalogAccessible ? "Passed" : "Blocked") : "Unknown"}
                icon={Waypoints}
              />
              <div className="sm:col-span-2">
                <SummaryCard
                  label="Delete policy"
                  value="Shared-digest deletes blocked"
                  icon={ShieldAlert}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardDescription>Common tasks</CardDescription>
            <CardTitle>Start here</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextActions.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="soft-panel block rounded-2xl p-4 transition-colors hover:bg-accent/55"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Safety model</CardDescription>
            <CardTitle>Maintenance guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="soft-panel rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4" />
                Plain Docker Registry rules
              </div>
              <p className="text-sm leading-6 text-foreground">
                This UI deletes by manifest digest, not by an isolated tag record. If multiple tags share one digest,
                they are protected from direct deletion in the UI.
              </p>
            </div>
            <div className="status-warning rounded-2xl p-4 text-sm leading-6">
              Bulk cleanup only executes singleton-digest candidates. Shared-digest tags are previewed as blocked and
              left untouched.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
