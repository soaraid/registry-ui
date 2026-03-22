"use client";

import type { ComponentType, FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Layers3, RefreshCcw, ShieldAlert, Tag, Trash2 } from "lucide-react";

import type { BulkCleanupExecutionResult, BulkCleanupPreview } from "@/lib/docker-api";
import { getBulkCleanupExecuteApiPath, getBulkCleanupPreviewApiPath } from "@/lib/paths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface BulkCleanupPanelProps {
  repository: string;
}

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function parseKeepLast(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function BulkCleanupPanel({ repository }: BulkCleanupPanelProps) {
  const queryClient = useQueryClient();
  const [keepLast, setKeepLast] = useState("3");
  const [prefix, setPrefix] = useState("");
  const [regex, setRegex] = useState("");
  const [preview, setPreview] = useState<BulkCleanupPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const previewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(getBulkCleanupPreviewApiPath(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository,
          keepLast: parseKeepLast(keepLast),
          prefix: prefix.trim() || undefined,
          regex: regex.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as BulkCleanupPreview & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to generate cleanup preview.");
      }

      return payload;
    },
    onMutate: () => {
      setPreviewError(null);
    },
    onSuccess: (payload) => {
      setPreview(payload);
    },
    onError: (error) => {
      setPreview(null);
      setPreviewError(error instanceof Error ? error.message : "Failed to generate cleanup preview.");
    },
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(getBulkCleanupExecuteApiPath(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository,
          keepLast: parseKeepLast(keepLast),
          prefix: prefix.trim() || undefined,
          regex: regex.trim() || undefined,
          confirmed: true,
        }),
      });

      const payload = (await response.json()) as BulkCleanupExecutionResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to execute bulk cleanup.");
      }

      return payload;
    },
    onSuccess: async () => {
      setConfirmOpen(false);
      setPreview(null);
      await queryClient.invalidateQueries({
        queryKey: ["registry", "repository", repository, "tags"],
      });
    },
    onError: (error) => {
      setPreviewError(error instanceof Error ? error.message : "Failed to execute bulk cleanup.");
    },
  });

  function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    previewMutation.mutate();
  }

  return (
    <>
      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardDescription>Batch maintenance</CardDescription>
            <CardTitle>Safe bulk cleanup</CardTitle>
          </div>
          <Badge variant="outline">Singleton digests only</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid gap-4 xl:grid-cols-[140px_1fr_1fr_auto]" onSubmit={handlePreview}>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground" htmlFor="keep-last">
                Keep last N
              </label>
              <Input
                id="keep-last"
                type="number"
                min="0"
                value={keepLast}
                onChange={(event) => setKeepLast(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground" htmlFor="prefix">
                Prefix filter
              </label>
              <Input
                id="prefix"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
                placeholder="release-"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground" htmlFor="regex">
                Regex filter
              </label>
              <Input
                id="regex"
                value={regex}
                onChange={(event) => setRegex(event.target.value)}
                placeholder="^v\\d+"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full gap-2 xl:w-auto" type="submit" disabled={previewMutation.isPending}>
                <RefreshCcw className={`h-4 w-4 ${previewMutation.isPending ? "animate-spin" : ""}`} />
                Preview cleanup
              </Button>
            </div>
          </form>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
            Tags are sorted by natural descending tag name for the keep-last rule. Shared-digest tags are always blocked
            from batch deletion.
          </div>

          {previewMutation.isPending ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : null}

          {previewError ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-50">
              {previewError}
            </div>
          ) : null}

          {preview ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Matched" value={String(preview.summary.matchedCount)} icon={Tag} />
                <SummaryCard label="Kept" value={String(preview.summary.keptCount)} icon={ShieldAlert} />
                <SummaryCard label="Deletable" value={String(preview.summary.deletableCount)} icon={Trash2} />
                <SummaryCard label="Blocked" value={String(preview.summary.blockedCount)} icon={Layers3} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Sort: natural descending tag name</Badge>
                <Badge variant="outline">Keep last: {preview.rule.keepLast}</Badge>
                {preview.rule.prefix ? <Badge variant="outline">Prefix: {preview.rule.prefix}</Badge> : null}
                {preview.rule.regex ? <Badge variant="outline">Regex: {preview.rule.regex}</Badge> : null}
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">Kept tags</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.keptTags.length ? (
                      preview.keptTags.map((tag) => <Badge key={tag}>{tag}</Badge>)
                    ) : (
                      <span className="text-sm text-muted-foreground">No tags are pinned by the keep-last rule.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="mb-3 text-sm font-medium text-emerald-50">Safe deletions</p>
                  <div className="space-y-2">
                    {preview.deletable.length ? (
                      preview.deletable.map((item) => (
                        <div key={item.tag} className="rounded-xl border border-emerald-400/20 bg-black/10 px-3 py-2">
                          <p className="text-sm font-medium text-emerald-50">{item.tag}</p>
                          <p className="mt-1 break-all font-mono text-xs text-emerald-100/80">{item.digest}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-emerald-100/80">No safe deletions for this preview.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="mb-3 text-sm font-medium text-amber-50">Blocked tags</p>
                  <div className="space-y-2">
                    {preview.blocked.length ? (
                      preview.blocked.map((item) => (
                        <div key={`${item.tag}-${item.digest ?? "no-digest"}`} className="rounded-xl border border-amber-400/20 bg-black/10 px-3 py-2">
                          <p className="text-sm font-medium text-amber-50">{item.tag}</p>
                          <p className="mt-1 text-xs text-amber-100/80">{item.reason}</p>
                          {item.relatedTags.length ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.relatedTags.map((relatedTag) => (
                                <Badge key={`${item.tag}-${relatedTag}`} variant="outline">
                                  {relatedTag}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-amber-100/80">No blocked tags in this preview.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Preview generated at {new Date(preview.checkedAt).toLocaleString()}.</p>
                  <p>Only safe singleton-digest candidates can be executed.</p>
                </div>
                <Button
                  variant="destructive"
                  className="gap-2"
                  disabled={!preview.executionReady}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {preview.summary.deletableCount} safe tag{preview.summary.deletableCount === 1 ? "" : "s"}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Execute bulk cleanup?"
        description="This will delete only the safe singleton-digest tags from the current preview."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={executeMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => executeMutation.mutate()} disabled={executeMutation.isPending}>
              {executeMutation.isPending ? "Deleting..." : "Confirm cleanup"}
            </Button>
          </div>
        }
        className="max-w-2xl"
      >
        {preview ? (
          <div className="space-y-4">
            <div className="flex gap-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-200" />
              <div className="space-y-2 text-sm leading-6 text-rose-50">
                <p>
                  The current preview will delete <span className="font-medium">{preview.summary.deletableCount}</span>{" "}
                  safe tag{preview.summary.deletableCount === 1 ? "" : "s"}.
                </p>
                <p>Blocked tags will remain untouched.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Tags to delete</p>
              <div className="flex flex-wrap gap-2">
                {preview.deletable.map((item) => (
                  <Badge key={item.tag}>{item.tag}</Badge>
                ))}
              </div>
            </div>

            {executeMutation.isError ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
                {(executeMutation.error as Error).message}
              </div>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
