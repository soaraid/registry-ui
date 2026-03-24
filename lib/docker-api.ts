import { getRegistryEnv } from "@/lib/env";

export interface RegistryCatalogResponse {
  repositories: string[];
}

export interface RegistryTagsResponse {
  name: string;
  tags: string[] | null;
}

export interface RegistryRequestInit extends RequestInit {
  scope?: string;
  searchParams?: Record<string, string | number | undefined>;
}

interface RegistryErrorPayload {
  errors?: Array<{
    code?: string;
    message?: string;
    detail?: unknown;
  }>;
}

type ChallengeParams = Record<string, string>;

const tokenCache = new Map<string, { token: string; expiresAt: number }>();
const manifestAcceptHeader = [
  "application/vnd.oci.image.index.v1+json",
  "application/vnd.docker.distribution.manifest.list.v2+json",
  "application/vnd.oci.image.manifest.v1+json",
  "application/vnd.docker.distribution.manifest.v2+json",
].join(", ");

export interface ManifestLayer {
  digest: string;
  mediaType?: string;
  size?: number;
}

export interface PlatformManifest {
  digest: string;
  mediaType?: string;
  size?: number;
  architecture?: string;
  os?: string;
  variant?: string;
}

export interface ManifestSummary {
  repository: string;
  reference: string;
  digest?: string;
  imageReference: string;
  pullCommand: string;
  mediaType?: string;
  schemaVersion?: number;
  contentKind: "image" | "index" | "unknown";
  architectures: string[];
  oses: string[];
  layerCount: number;
  totalSize: number | null;
  configDigest?: string;
  layers: ManifestLayer[];
  manifests: PlatformManifest[];
  raw: Record<string, unknown>;
}

export interface DeleteTagPreview {
  repository: string;
  tag: string;
  digest: string;
  affectedTags: string[];
  canDelete: boolean;
  deleteMode: "single-tag" | "shared-digest";
  warning: string;
}

export interface RegistryHealthReport {
  checkedAt: string;
  registryHost: string;
  pullHost: string;
  authMode: string;
  reachable: boolean;
  registryApiAvailable: boolean;
  catalogAccessible: boolean;
  responseTimeMs: number;
  catalogProbeCount: number | null;
  error?: string;
  catalogError?: string;
}

export interface RepositoryDigestGraph {
  tags: string[];
  tagToDigest: Record<string, string>;
  digestToTags: Record<string, string[]>;
  unresolvedTags: Array<{
    tag: string;
    reason: string;
  }>;
}

export interface BulkCleanupRule {
  keepLast: number;
  prefix?: string;
  regex?: string;
  sortMode: "natural-desc-tag";
}

export interface BulkCleanupBlockedTag {
  tag: string;
  digest?: string;
  reason: string;
  relatedTags: string[];
}

export interface BulkCleanupDeletableTag {
  tag: string;
  digest: string;
}

export interface BulkCleanupPreview {
  repository: string;
  checkedAt: string;
  rule: BulkCleanupRule;
  totalTags: number;
  matchedTags: string[];
  keptTags: string[];
  deletable: BulkCleanupDeletableTag[];
  blocked: BulkCleanupBlockedTag[];
  executionReady: boolean;
  summary: {
    matchedCount: number;
    keptCount: number;
    deletableCount: number;
    blockedCount: number;
  };
}

export interface BulkCleanupExecutionResult {
  repository: string;
  executedAt: string;
  preview: BulkCleanupPreview;
  deleted: BulkCleanupDeletableTag[];
  failed: Array<{
    tag: string;
    digest: string;
    reason: string;
  }>;
}

function buildRegistryUrl(pathname: string, searchParams?: RegistryRequestInit["searchParams"]) {
  const { url } = getRegistryEnv();
  const target = new URL(`${url}${pathname}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        target.searchParams.set(key, String(value));
      }
    }
  }

  return target;
}

function parseBearerChallenge(header: string): ChallengeParams | null {
  if (!header.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const rawParams = header.slice(7);
  const params: ChallengeParams = {};

  for (const part of rawParams.split(",")) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const rawKey = part.slice(0, separatorIndex);
    const rawValue = part.slice(separatorIndex + 1);

    if (!rawKey || !rawValue) {
      continue;
    }

    params[rawKey.trim()] = rawValue.trim().replace(/^"|"$/g, "");
  }

  return params.realm ? params : null;
}

function getRegistryImageBase() {
  const env = getRegistryEnv();
  const rawValue = env.publicUrl || env.url;

  if (/^https?:\/\//i.test(rawValue)) {
    const registryUrl = new URL(rawValue);
    const pathname = registryUrl.pathname.replace(/^\/+|\/+$/g, "").replace(/\/v2$/i, "");

    return pathname ? `${registryUrl.host}/${pathname}` : registryUrl.host;
  }

  return rawValue.replace(/^\/+|\/+$/g, "").replace(/\/v2$/i, "");
}

function getRegistryHost() {
  const env = getRegistryEnv();
  return new URL(env.url).host;
}

function getRegistryPullHost() {
  const env = getRegistryEnv();
  const rawValue = env.publicUrl || env.url;

  if (/^https?:\/\//i.test(rawValue)) {
    const registryUrl = new URL(rawValue);
    const pathname = registryUrl.pathname.replace(/^\/+|\/+$/g, "").replace(/\/v2$/i, "");

    return pathname ? `${registryUrl.host}/${pathname}` : registryUrl.host;
  }

  return rawValue.replace(/^\/+|\/+$/g, "").replace(/\/v2$/i, "");
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

const naturalTagCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function sortTagsDescending(tags: string[]) {
  return [...tags].sort((left, right) => naturalTagCollator.compare(right, left));
}

async function getBearerToken(scope?: string) {
  const env = getRegistryEnv();

  if (env.bearerToken) {
    return env.bearerToken;
  }

  if (!scope) {
    return undefined;
  }

  const cacheKey = `${env.url}:${scope}`;
  const cachedToken = tokenCache.get(cacheKey);

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const pingResponse = await fetch(buildRegistryUrl("/v2/"), {
    headers: getDefaultHeaders(),
    cache: "no-store",
  });

  const challengeHeader = pingResponse.headers.get("www-authenticate");

  if (!challengeHeader) {
    return undefined;
  }

  const challenge = parseBearerChallenge(challengeHeader);

  if (!challenge?.realm) {
    return undefined;
  }

  const tokenUrl = new URL(challenge.realm);

  if (challenge.service) {
    tokenUrl.searchParams.set("service", challenge.service);
  }

  tokenUrl.searchParams.set("scope", scope);

  if (env.username) {
    tokenUrl.searchParams.set("account", env.username);
  }

  const tokenHeaders = new Headers();

  if (env.username || env.password) {
    tokenHeaders.set(
      "Authorization",
      `Basic ${Buffer.from(`${env.username ?? ""}:${env.password ?? ""}`).toString("base64")}`,
    );
  }

  const tokenResponse = await fetch(tokenUrl, {
    headers: tokenHeaders,
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    return undefined;
  }

  const tokenPayload = (await tokenResponse.json()) as
    | { token?: string; access_token?: string; expires_in?: number }
    | undefined;

  const token = tokenPayload?.token ?? tokenPayload?.access_token;

  if (!token) {
    return undefined;
  }

  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + ((tokenPayload?.expires_in ?? 300) - 15) * 1000,
  });

  return token;
}

function getDefaultHeaders() {
  const env = getRegistryEnv();
  const headers = new Headers({
    Accept: "application/json",
  });

  if (env.authMode === "basic" && (env.username || env.password)) {
    headers.set(
      "Authorization",
      `Basic ${Buffer.from(`${env.username ?? ""}:${env.password ?? ""}`).toString("base64")}`,
    );
  }

  if (env.authMode === "bearer" && env.bearerToken) {
    headers.set("Authorization", `Bearer ${env.bearerToken}`);
  }

  return headers;
}

async function parseRegistryError(response: Response) {
  let payload: RegistryErrorPayload | null = null;

  try {
    payload = (await response.json()) as RegistryErrorPayload;
  } catch {
    payload = null;
  }

  const detail = payload?.errors?.[0];

  return new Error(
    detail?.message ||
      detail?.code ||
      `Registry request failed with ${response.status} ${response.statusText}`,
  );
}

async function registryFetch(pathname: string, init: RegistryRequestInit = {}) {
  const { scope, searchParams, headers, ...requestInit } = init;
  const requestHeaders = getDefaultHeaders();

  if (headers) {
    const extraHeaders = new Headers(headers);
    extraHeaders.forEach((value, key) => requestHeaders.set(key, value));
  }

  const execute = async () =>
    fetch(buildRegistryUrl(pathname, searchParams), {
      ...requestInit,
      headers: requestHeaders,
      cache: "no-store",
    });

  let response = await execute();

  if (response.status === 401) {
    const token = await getBearerToken(scope);

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
      response = await execute();
    }
  }

  return response;
}

export async function registryRequest<T>(
  pathname: string,
  init: RegistryRequestInit = {},
): Promise<T> {
  const response = await registryFetch(pathname, init);

  if (!response.ok) {
    throw await parseRegistryError(response);
  }

  if ([202, 204, 205, 304].includes(response.status)) {
    return undefined as T;
  }

  const contentLength = response.headers.get("content-length");
  const text = await response.text();

  if (contentLength === "0" || !text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function getCatalog(options?: {
  limit?: number;
  last?: string;
}): Promise<RegistryCatalogResponse> {
  return registryRequest<RegistryCatalogResponse>("/v2/_catalog", {
    scope: "registry:catalog:*",
    searchParams: {
      n: options?.limit,
      last: options?.last,
    },
  });
}

export async function getRegistryHealthReport(): Promise<RegistryHealthReport> {
  const startedAt = Date.now();

  try {
    const env = getRegistryEnv();
    const response = await registryFetch("/v2/", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw await parseRegistryError(response);
    }

    let catalogAccessible = true;
    let catalogProbeCount: number | null = null;
    let catalogError: string | undefined;

    try {
      const catalog = await getCatalog({ limit: 1 });
      catalogProbeCount = catalog.repositories.length;
    } catch (error) {
      catalogAccessible = false;
      catalogError = error instanceof Error ? error.message : "Catalog probe failed.";
    }

    return {
      checkedAt: new Date().toISOString(),
      registryHost: getRegistryHost(),
      pullHost: getRegistryPullHost(),
      authMode: env.authMode,
      reachable: true,
      registryApiAvailable: true,
      catalogAccessible,
      responseTimeMs: Date.now() - startedAt,
      catalogProbeCount,
      catalogError,
    };
  } catch (error) {
    return {
      checkedAt: new Date().toISOString(),
      registryHost: (() => {
        try {
          return getRegistryHost();
        } catch {
          return "Unavailable";
        }
      })(),
      pullHost: (() => {
        try {
          return getRegistryPullHost();
        } catch {
          return "Unavailable";
        }
      })(),
      authMode: (() => {
        try {
          return getRegistryEnv().authMode;
        } catch {
          return "unknown";
        }
      })(),
      reachable: false,
      registryApiAvailable: false,
      catalogAccessible: false,
      responseTimeMs: Date.now() - startedAt,
      catalogProbeCount: null,
      error: error instanceof Error ? error.message : "Registry health check failed.",
    };
  }
}

export async function getTags(repository: string, options?: { limit?: number; last?: string }) {
  return registryRequest<RegistryTagsResponse>(`/v2/${repository}/tags/list`, {
    scope: `repository:${repository}:pull`,
    searchParams: {
      n: options?.limit,
      last: options?.last,
    },
  });
}

export async function getRepositoryDigestGraph(repository: string): Promise<RepositoryDigestGraph> {
  const tagsPayload = await getTags(repository);
  const tags = sortTagsDescending(tagsPayload.tags ?? []);
  const digestEntries = await Promise.all(
    tags.map(async (tag) => {
      try {
        return {
          tag,
          digest: await getManifestDigest(repository, tag),
        };
      } catch (error) {
        return {
          tag,
          error: error instanceof Error ? error.message : "Digest resolution failed unexpectedly.",
        };
      }
    }),
  );

  const tagToDigest: Record<string, string> = {};
  const digestToTags: Record<string, string[]> = {};
  const unresolvedTags: RepositoryDigestGraph["unresolvedTags"] = [];

  for (const entry of digestEntries) {
    if ("error" in entry) {
      unresolvedTags.push({
        tag: entry.tag,
        reason: entry.error ?? "Digest resolution failed unexpectedly.",
      });
      continue;
    }

    const digest = entry.digest;

    if (!digest) {
      unresolvedTags.push({
        tag: entry.tag,
        reason: "Digest could not be resolved.",
      });
      continue;
    }

    tagToDigest[entry.tag] = digest;
    digestToTags[digest] = [...(digestToTags[digest] ?? []), entry.tag];
  }

  for (const digest of Object.keys(digestToTags)) {
    digestToTags[digest] = sortTagsDescending(digestToTags[digest] ?? []);
  }

  return {
    tags,
    tagToDigest,
    digestToTags,
    unresolvedTags,
  };
}

export async function getManifest(repository: string, reference: string) {
  return registryRequest<Record<string, unknown>>(`/v2/${repository}/manifests/${reference}`, {
    scope: `repository:${repository}:pull`,
    headers: {
      Accept: manifestAcceptHeader,
    },
  });
}

export async function getManifestDigest(repository: string, reference: string) {
  const response = await registryFetch(`/v2/${repository}/manifests/${reference}`, {
    method: "HEAD",
    scope: `repository:${repository}:pull`,
    headers: {
      Accept: manifestAcceptHeader,
    },
  });

  if (!response.ok) {
    throw await parseRegistryError(response);
  }

  return response.headers.get("docker-content-digest") ?? undefined;
}

export async function getBlob<T = Record<string, unknown>>(repository: string, digest: string) {
  return registryRequest<T>(`/v2/${repository}/blobs/${digest}`, {
    scope: `repository:${repository}:pull`,
    headers: {
      Accept: "application/json",
    },
  });
}

function getPlatformData(raw: Record<string, unknown>) {
  const manifests = Array.isArray(raw.manifests)
    ? raw.manifests
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => {
          const platform =
            typeof item.platform === "object" && item.platform !== null
              ? (item.platform as Record<string, unknown>)
              : undefined;

          return {
            digest: typeof item.digest === "string" ? item.digest : "",
            mediaType: typeof item.mediaType === "string" ? item.mediaType : undefined,
            size: typeof item.size === "number" ? item.size : undefined,
            architecture: typeof platform?.architecture === "string" ? platform.architecture : undefined,
            os: typeof platform?.os === "string" ? platform.os : undefined,
            variant: typeof platform?.variant === "string" ? platform.variant : undefined,
          } satisfies PlatformManifest;
        })
        .filter((item) => item.digest)
    : [];

  return manifests;
}

function getLayerData(raw: Record<string, unknown>) {
  return Array.isArray(raw.layers)
    ? raw.layers
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          digest: typeof item.digest === "string" ? item.digest : "",
          mediaType: typeof item.mediaType === "string" ? item.mediaType : undefined,
          size: typeof item.size === "number" ? item.size : undefined,
        }))
        .filter((item) => item.digest)
    : [];
}

function getContentKind(raw: Record<string, unknown>): ManifestSummary["contentKind"] {
  const mediaType = typeof raw.mediaType === "string" ? raw.mediaType : "";

  if (
    mediaType.includes("manifest.list") ||
    mediaType.includes("image.index") ||
    Array.isArray(raw.manifests)
  ) {
    return "index";
  }

  if (Array.isArray(raw.layers) || raw.config) {
    return "image";
  }

  return "unknown";
}

export async function getManifestSummary(repository: string, reference: string): Promise<ManifestSummary> {
  const response = await registryFetch(`/v2/${repository}/manifests/${reference}`, {
    scope: `repository:${repository}:pull`,
    headers: {
      Accept: manifestAcceptHeader,
    },
  });

  if (!response.ok) {
    throw await parseRegistryError(response);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const digest = response.headers.get("docker-content-digest") ?? undefined;
  const manifests = getPlatformData(raw);
  const layers = getLayerData(raw);
  const mediaType =
    response.headers.get("content-type") ??
    (typeof raw.mediaType === "string" ? raw.mediaType : undefined);
  const config =
    typeof raw.config === "object" && raw.config !== null
      ? (raw.config as Record<string, unknown>)
      : undefined;
  const configDigest = typeof config?.digest === "string" ? config.digest : undefined;

  let architectures = unique(manifests.map((item) => item.architecture));
  let oses = unique(manifests.map((item) => item.os));

  if ((!architectures.length || !oses.length) && configDigest) {
    try {
      const blob = await getBlob<Record<string, unknown>>(repository, configDigest);
      architectures = architectures.length
        ? architectures
        : unique([typeof blob.architecture === "string" ? blob.architecture : undefined]);
      oses = oses.length ? oses : unique([typeof blob.os === "string" ? blob.os : undefined]);
    } catch {
      // Config blob resolution is best-effort to avoid blocking core manifest workflows.
    }
  }

  const totalSize =
    layers.length > 0
      ? layers.reduce((total, layer) => total + (layer.size ?? 0), 0)
      : manifests.length > 0
        ? manifests.reduce((total, manifest) => total + (manifest.size ?? 0), 0)
        : null;

  const imageReference = `${getRegistryImageBase()}/${repository}:${reference}`;

  return {
    repository,
    reference,
    digest,
    imageReference,
    pullCommand: `docker pull ${imageReference}`,
    mediaType,
    schemaVersion: typeof raw.schemaVersion === "number" ? raw.schemaVersion : undefined,
    contentKind: getContentKind(raw),
    architectures,
    oses,
    layerCount: layers.length,
    totalSize,
    configDigest,
    layers,
    manifests,
    raw,
  };
}

export async function deleteManifest(repository: string, digest: string) {
  return registryRequest<void>(`/v2/${repository}/manifests/${digest}`, {
    method: "DELETE",
    scope: `repository:${repository}:*`,
  });
}

export async function getDeleteTagPreview(repository: string, tag: string): Promise<DeleteTagPreview> {
  const digestGraph = await getRepositoryDigestGraph(repository);
  const digest = digestGraph.tagToDigest[tag];

  if (!digest) {
    throw new Error(`Unable to resolve a manifest digest for tag "${tag}".`);
  }

  const affectedTags = digestGraph.digestToTags[digest] ?? [tag];

  return {
    repository,
    tag,
    digest,
    affectedTags,
    canDelete: affectedTags.length <= 1,
    deleteMode: affectedTags.length <= 1 ? "single-tag" : "shared-digest",
    warning:
      affectedTags.length <= 1
        ? "This manifest digest appears to be referenced by only this tag."
        : `This manifest digest is shared by ${affectedTags.length} tags. Deleting it would remove all of them.`,
  };
}

export async function getBulkCleanupPreview(
  repository: string,
  options: {
    keepLast?: number;
    prefix?: string;
    regex?: string;
  },
): Promise<BulkCleanupPreview> {
  const keepLast = Math.max(0, options.keepLast ?? 0);
  const prefix = options.prefix?.trim() || undefined;
  const regexSource = options.regex?.trim() || undefined;
  const matcher = regexSource ? new RegExp(regexSource) : null;
  const digestGraph = await getRepositoryDigestGraph(repository);
  const matchedTags = digestGraph.tags.filter((tag) => {
    if (prefix && !tag.startsWith(prefix)) {
      return false;
    }

    if (matcher && !matcher.test(tag)) {
      return false;
    }

    return true;
  });
  const keptTags = matchedTags.slice(0, keepLast);
  const candidateTags = matchedTags.slice(keepLast);
  const unresolvedMap = new Map(digestGraph.unresolvedTags.map((entry) => [entry.tag, entry.reason]));
  const deletable: BulkCleanupDeletableTag[] = [];
  const blocked: BulkCleanupBlockedTag[] = [];

  for (const tag of candidateTags) {
    const unresolvedReason = unresolvedMap.get(tag);

    if (unresolvedReason) {
      blocked.push({
        tag,
        reason: unresolvedReason,
        relatedTags: [],
      });
      continue;
    }

    const digest = digestGraph.tagToDigest[tag];

    if (!digest) {
      blocked.push({
        tag,
        reason: "Digest could not be resolved.",
        relatedTags: [],
      });
      continue;
    }

    const relatedTags = digestGraph.digestToTags[digest] ?? [tag];

    if (relatedTags.length > 1) {
      blocked.push({
        tag,
        digest,
        reason: `Digest is shared by ${relatedTags.length} tags.`,
        relatedTags,
      });
      continue;
    }

    deletable.push({
      tag,
      digest,
    });
  }

  return {
    repository,
    checkedAt: new Date().toISOString(),
    rule: {
      keepLast,
      prefix,
      regex: regexSource,
      sortMode: "natural-desc-tag",
    },
    totalTags: digestGraph.tags.length,
    matchedTags,
    keptTags,
    deletable,
    blocked,
    executionReady: deletable.length > 0,
    summary: {
      matchedCount: matchedTags.length,
      keptCount: keptTags.length,
      deletableCount: deletable.length,
      blockedCount: blocked.length,
    },
  };
}

export async function executeBulkCleanup(
  repository: string,
  options: {
    keepLast?: number;
    prefix?: string;
    regex?: string;
  },
): Promise<BulkCleanupExecutionResult> {
  const preview = await getBulkCleanupPreview(repository, options);
  const settledDeletes = await Promise.allSettled(
    preview.deletable.map(async (item) => {
      await deleteManifest(repository, item.digest);
      return item;
    }),
  );
  const deleted: BulkCleanupDeletableTag[] = [];
  const failed: BulkCleanupExecutionResult["failed"] = [];

  settledDeletes.forEach((entry, index) => {
    const item = preview.deletable[index];

    if (!item) {
      return;
    }

    if (entry.status === "fulfilled") {
      deleted.push(item);
      return;
    }

    failed.push({
      tag: item.tag,
      digest: item.digest,
      reason: entry.reason instanceof Error ? entry.reason.message : "Delete failed unexpectedly.",
    });
  });

  return {
    repository,
    executedAt: new Date().toISOString(),
    preview,
    deleted,
    failed,
  };
}

export async function deleteTag(repository: string, tag: string) {
  const preview = await getDeleteTagPreview(repository, tag);

  if (!preview.canDelete) {
    throw new Error(
      `Delete blocked: digest ${preview.digest} is shared by ${preview.affectedTags.length} tags (${preview.affectedTags.join(", ")}).`,
    );
  }

  await deleteManifest(repository, preview.digest);

  return {
    tag,
    digest: preview.digest,
    affectedTags: preview.affectedTags,
  };
}
