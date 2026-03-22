"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  Layers3,
  LoaderCircle,
  MonitorCog,
  ScanSearch,
  Trash2,
} from "lucide-react";

import { useDeleteTagPreview } from "@/hooks/use-delete-tag-preview";
import { useInView } from "@/hooks/use-in-view";
import { useManifestSummary } from "@/hooks/use-manifest-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { buildTagApiPath } from "@/lib/paths";

interface TagManagementCardProps {
  repository: string;
  tag: string;
}

function formatBytes(value: number | null) {
  if (value === null) {
    return "Unknown";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let currentValue = value;
  let unitIndex = 0;

  while (currentValue >= 1024 && unitIndex < units.length - 1) {
    currentValue /= 1024;
    unitIndex += 1;
  }

  return `${currentValue.toFixed(currentValue >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}

export function TagManagementCard({ repository, tag }: TagManagementCardProps) {
  const queryClient = useQueryClient();
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { ref, isInView } = useInView<HTMLDivElement>();
  const manifestQuery = useManifestSummary(repository, tag, isInView || inspectorOpen);
  const deletePreviewQuery = useDeleteTagPreview(repository, tag, confirmDeleteOpen);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${buildTagApiPath(repository, tag)}&confirmed=true`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to delete tag "${tag}".`);
      }

      return (await response.json()) as { deleted: boolean; digest?: string };
    },
    onSuccess: async () => {
      setConfirmDeleteOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["registry", "repository", repository, "tags"],
      });
      queryClient.removeQueries({
        queryKey: ["registry", "repository", repository, "manifest", tag],
      });
    },
  });

  const manifest = manifestQuery.data;
  const metadataLoading = manifestQuery.isLoading && !manifest;
  const deletePreview = deletePreviewQuery.data;
  const affectedTags = deletePreview?.affectedTags ?? [];
  const multiTagDelete = affectedTags.length > 1;

  return (
    <>
      <Card ref={ref} className="border-white/10 bg-white/[0.03] transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit bg-white/8">{tag}</Badge>
            <div>
              <CardTitle className="text-xl">{repository}</CardTitle>
              <CardDescription className="mt-2 break-all font-mono text-xs">
                {manifest?.digest ?? "Digest will appear after manifest metadata loads."}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {metadataLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setInspectorOpen(true)}>
              <ScanSearch className="h-4 w-4" />
              Inspect
            </Button>
            <Button variant="destructive" size="sm" className="gap-2" onClick={() => setConfirmDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <CodeBlock
            label="Pull command"
            code={manifest?.pullCommand ?? `docker pull <registry-host>/${repository}:${tag}`}
          />

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MonitorCog className="h-4 w-4" />
                Platform
              </div>
              <div className="flex flex-wrap gap-2">
                {metadataLoading ? (
                  <>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </>
                ) : manifest?.architectures.length || manifest?.oses.length ? (
                  <>
                    {manifest.architectures.map((architecture) => (
                      <Badge key={architecture}>{architecture}</Badge>
                    ))}
                    {manifest.oses.map((os) => (
                      <Badge key={os} variant="outline">
                        {os}
                      </Badge>
                    ))}
                  </>
                ) : (
                  <Badge variant="outline">Unknown platform</Badge>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Layers3 className="h-4 w-4" />
                Layers
              </div>
              {metadataLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <>
                  <p className="text-2xl font-semibold tracking-tight">{manifest?.layerCount ?? 0}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Estimated payload {formatBytes(manifest?.totalSize ?? null)}</p>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Boxes className="h-4 w-4" />
                Manifest type
              </div>
              {metadataLoading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                <>
                  <p className="text-lg font-medium capitalize">{manifest?.contentKind ?? "Unknown"}</p>
                  <p className="mt-2 break-all text-xs text-muted-foreground">{manifest?.mediaType ?? "Media type unavailable"}</p>
                </>
              )}
            </div>
          </div>

          {manifestQuery.isError ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
              {(manifestQuery.error as Error).message}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        title={`Manifest inspector: ${tag}`}
        description="Review the resolved manifest, digest, layers, and platform metadata before taking action."
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setInspectorOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {manifestQuery.isLoading && !manifest ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : manifestQuery.isError ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-50">
            {(manifestQuery.error as Error).message}
          </div>
        ) : manifest ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailRow label="Digest" value={manifest.digest ?? "Unavailable"} />
              <DetailRow
                label="Architecture"
                value={manifest.architectures.length ? manifest.architectures.join(", ") : "Unknown"}
              />
              <DetailRow label="OS" value={manifest.oses.length ? manifest.oses.join(", ") : "Unknown"} />
              <DetailRow label="Layers" value={String(manifest.layerCount)} />
            </div>

            {manifest.layers.length ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Layers</p>
                <div className="space-y-2">
                  {manifest.layers.map((layer) => (
                    <div
                      key={layer.digest}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
                    >
                      <p className="break-all font-mono text-xs text-foreground">{layer.digest}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {layer.mediaType ?? "Unknown media type"} · {formatBytes(layer.size ?? null)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {manifest.manifests.length ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Platform matrix</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {manifest.manifests.map((item) => (
                    <div
                      key={item.digest}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
                    >
                      <p className="font-medium">
                        {item.architecture ?? "unknown"} / {item.os ?? "unknown"}
                      </p>
                      <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{item.digest}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Raw JSON</p>
              <pre className="max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-zinc-950/90 p-4 text-xs leading-6 text-zinc-100">
                {JSON.stringify(manifest.raw, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Delete tag "${tag}"?`}
        description="This removes the manifest reference from the registry. Keep this guarded behind operator confirmation."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending || deletePreviewQuery.isLoading}
            >
              {deleteMutation.isPending ? "Deleting..." : deletePreviewQuery.isLoading ? "Checking impact..." : "Confirm delete"}
            </Button>
          </div>
        }
        className="max-w-xl"
      >
        <div className="flex gap-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-200" />
          <div className="space-y-2 text-sm leading-6 text-rose-50">
            <p>
              You are about to delete <span className="font-medium">{repository}:{tag}</span>.
            </p>
            <p>The action is proxied server-side and resolved against the current manifest digest.</p>
          </div>
        </div>

        {deletePreviewQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : deletePreviewQuery.isError ? (
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
            {(deletePreviewQuery.error as Error).message}
          </div>
        ) : deletePreview ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Resolved digest</p>
              <p className="mt-2 break-all font-mono text-xs text-foreground">{deletePreview.digest}</p>
            </div>

            <div
              className={`rounded-2xl border p-4 text-sm leading-6 ${
                multiTagDelete
                  ? "border-rose-400/20 bg-rose-400/10 text-rose-50"
                  : "border-amber-400/20 bg-amber-400/10 text-amber-50"
              }`}
            >
              {multiTagDelete ? (
                <p>
                  This digest is shared by <span className="font-medium">{affectedTags.length}</span> tags.
                  Deleting it will remove all of them, not just <span className="font-medium">{tag}</span>.
                </p>
              ) : (
                <p>This digest currently appears to be referenced only by this tag.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Affected tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {affectedTags.map((affectedTag) => (
                  <Badge key={affectedTag} variant={affectedTag === tag ? "default" : "outline"}>
                    {affectedTag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {deleteMutation.isError ? (
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
            {(deleteMutation.error as Error).message}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
