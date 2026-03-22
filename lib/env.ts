type RegistryAuthMode = "anonymous" | "basic" | "bearer";

export interface RegistryEnv {
  url: string;
  username?: string;
  password?: string;
  bearerToken?: string;
  authMode: RegistryAuthMode;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getRegistryEnv(): RegistryEnv {
  const url = process.env.REGISTRY_URL;

  if (!url) {
    throw new Error("Missing REGISTRY_URL environment variable.");
  }

  const username = process.env.REGISTRY_USERNAME?.trim() || undefined;
  const password = process.env.REGISTRY_PASSWORD?.trim() || undefined;
  const bearerToken = process.env.REGISTRY_BEARER_TOKEN?.trim() || undefined;

  const authMode: RegistryAuthMode = bearerToken
    ? "bearer"
    : username || password
      ? "basic"
      : "anonymous";

  return {
    url: trimTrailingSlash(url),
    username,
    password,
    bearerToken,
    authMode,
  };
}

