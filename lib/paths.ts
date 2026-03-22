export function repositoryToSegments(repository: string) {
  return repository.split("/").filter(Boolean);
}

export function decodeRepositorySegments(segments: string[]) {
  return segments.map((segment) => decodeURIComponent(segment)).join("/");
}

export function buildRepositoryPagePath(repository: string) {
  return `/repositories/${repositoryToSegments(repository).map(encodeURIComponent).join("/")}`;
}

export function buildManifestApiPath(repository: string, reference: string) {
  const searchParams = new URLSearchParams({
    repository,
    reference,
  });

  return `/api/registry/manifests?${searchParams.toString()}`;
}

export function buildTagsApiPath(repository: string) {
  const searchParams = new URLSearchParams({
    repository,
  });

  return `/api/registry/tags?${searchParams.toString()}`;
}

export function buildTagApiPath(repository: string, tag: string) {
  const searchParams = new URLSearchParams({
    repository,
    tag,
  });

  return `/api/registry/tag?${searchParams.toString()}`;
}

export function getBulkCleanupPreviewApiPath() {
  return "/api/registry/cleanup/preview";
}

export function getBulkCleanupExecuteApiPath() {
  return "/api/registry/cleanup/execute";
}
