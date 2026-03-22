"use client";

import Link from "next/link";
import { ArrowRight, Box, Layers3, TerminalSquare } from "lucide-react";

import { useRegistryCatalog } from "@/hooks/use-registry-catalog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const quickStart = [
  "Set REGISTRY_URL and auth env vars in .env.local.",
  "Open Repositories to browse the live /v2/_catalog response.",
  "Extend the proxy layer with tags, manifests, and delete handlers.",
];

export function DashboardOverview() {
  const catalogQuery = useRegistryCatalog();
  const totalRepositories = catalogQuery.data?.repositories.length ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent">
          <CardHeader>
            <Badge className="mb-2 w-fit">soara/registry-ui</Badge>
            <CardTitle className="max-w-2xl text-3xl tracking-tight md:text-4xl">
              A premium control plane for private Docker registries.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Next.js 15 shell, proxy-backed catalog access, and a dark operational UI with room for
              manifest inspection and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/repositories" className={cn(buttonVariants(), "gap-2")}>
              Open explorer
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
              Review registry settings
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Live overview</CardDescription>
            <CardTitle>Registry status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Box className="h-4 w-4" />
                Total repositories
              </div>
              {catalogQuery.isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <p className="text-4xl font-semibold tracking-tight">{totalRepositories}</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                Proxy surface
              </div>
              <p className="text-lg font-medium">Catalog online</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                `/api/registry/catalog` is ready for client-side query caching.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardDescription>Quick start</CardDescription>
            <CardTitle>Operator checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickStart.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-medium text-muted-foreground">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Command line bridge</CardDescription>
            <CardTitle>Quick start command</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
                <TerminalSquare className="h-4 w-4" />
                Development
              </div>
              <code className="block overflow-x-auto text-sm text-zinc-100">
                npm install
                <br />
                npm run dev
              </code>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The initial scaffold focuses on the application shell and the first registry proxy route.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
