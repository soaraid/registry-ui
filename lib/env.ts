type RegistryAuthMode = "anonymous" | "basic" | "bearer";

export interface RegistryEnv {
  url: string;
  username?: string;
  password?: string;
  bearerToken?: string;
  authMode: RegistryAuthMode;
}

export interface AppAuthEnv {
  enabled: boolean;
  username?: string;
  password?: string;
  sessionSecret?: string;
}

export interface AppBrandEnv {
  brandName: string;
  productName: string;
  displayName: string;
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

export function getAppAuthEnv(): AppAuthEnv {
  const username = process.env.APP_AUTH_USERNAME?.trim() || undefined;
  const password = process.env.APP_AUTH_PASSWORD?.trim() || undefined;
  const sessionSecret = process.env.APP_SESSION_SECRET?.trim() || undefined;

  return {
    enabled: Boolean(username && password && sessionSecret),
    username,
    password,
    sessionSecret,
  };
}

export function getAppBrandEnv(): AppBrandEnv {
  const brandName = process.env.APP_BRAND_NAME?.trim() || "Soara";
  const productName = process.env.APP_PRODUCT_NAME?.trim() || "Registry UI";

  return {
    brandName,
    productName,
    displayName: `${brandName} ${productName}`.trim(),
  };
}
