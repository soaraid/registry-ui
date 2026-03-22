"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ArrowLeft, RefreshCcw, Search, ShieldAlert, Tags } from "lucide-react";

import { useRepositoryTags } from "@/hooks/use-repository-tags";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TagManagementCard } from "@/components/repositories/tag-management-card";
import { cn } from "@/lib/utils";

interface RepositoryDetailClientProps {
  repository: string;
}

export function RepositoryDetailClient({ repository }: RepositoryDetailClientProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const tagsQuery = useRepositoryTags(repository);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const tags = tagsQuery.data?.tags ?? [];
  const filteredTags = normalizedQuery
    ? tags.filter((tag) => tag.toLowerCase().includes(normalizedQuery))
    : tags;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <Badge className="w-fit">Repository detail</Badge>
          <h2 className="text-3xl font-semibold tracking-tight">{repository}</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Inspect manifests, copy pull commands, and remove stale tags through a server-proxied workflow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/repositories" className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}>
            <ArrowLeft className="h-4 w-4" />
            Back to repositories
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => tagsQuery.refetch()} disabled={tagsQuery.isFetching}>
            <RefreshCcw className={`h-4 w-4 ${tagsQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh tags
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardDescription>Tag inventory</CardDescription>
            <CardTitle className="mt-2 flex items-center gap-3 text-2xl">
              <Tags className="h-5 w-5 text-muted-foreground" />
              {tagsQuery.isLoading ? "Loading tags" : `${tags.length} tag${tags.length === 1 ? "" : "s"}`}
            </CardTitle>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter tags"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">Live registry data</Badge>
          <Badge variant="outline">Search deferred for smoother filtering</Badge>
          <Badge variant="outline">Dangerous actions require confirmation</Badge>
          <Badge variant="outline">Shared-digest deletes are blocked</Badge>
        </CardContent>
      </Card>

      <Card className="border-amber-400/20 bg-amber-400/10">
        <CardContent className="flex gap-4 p-6">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
          <div className="space-y-2 text-sm leading-6 text-amber-50">
            <p className="font-medium">Registry-safe delete policy</p>
            <p>
              Plain Docker Registry deletes manifests by digest, not tags. If multiple tags share one digest, removing
              it would remove all of them. This UI now blocks those deletes and only allows singleton-digest cleanup.
            </p>
          </div>
        </CardContent>
      </Card>

      {tagsQuery.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-[280px] w-full" />
          <Skeleton className="h-[280px] w-full" />
        </div>
      ) : tagsQuery.isError ? (
        <Card className="border-rose-400/20 bg-rose-400/10">
          <CardContent className="p-6 text-sm text-rose-50">{(tagsQuery.error as Error).message}</CardContent>
        </Card>
      ) : filteredTags.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-lg font-medium text-foreground">No matching tags</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust the filter or refresh the repository to load the latest tag list.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTags.map((tag) => (
            <TagManagementCard key={tag} repository={repository} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
