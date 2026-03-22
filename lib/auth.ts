import { getAppAuthEnv } from "@/lib/env";

export const SESSION_COOKIE_NAME = "soara_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

async function signValue(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function isAppAuthEnabled() {
  return getAppAuthEnv().enabled;
}

export async function validateLoginCredentials(username: string, password: string) {
  const authEnv = getAppAuthEnv();

  if (!authEnv.enabled || !authEnv.username || !authEnv.password) {
    return false;
  }

  return username === authEnv.username && password === authEnv.password;
}

export async function createSessionToken() {
  const authEnv = getAppAuthEnv();

  if (!authEnv.enabled || !authEnv.username || !authEnv.sessionSecret) {
    throw new Error("App auth is not fully configured.");
  }

  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = `${authEnv.username}.${expiresAt}`;
  const signature = await signValue(payload, authEnv.sessionSecret);

  return {
    token: `${expiresAt}.${signature}`,
    expiresAt,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export async function verifySessionToken(token: string | null | undefined) {
  const authEnv = getAppAuthEnv();

  if (!authEnv.enabled || !authEnv.username || !authEnv.sessionSecret || !token) {
    return false;
  }

  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);

  if (!expiresAtRaw || !signature || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  const expectedSignature = await signValue(`${authEnv.username}.${expiresAt}`, authEnv.sessionSecret);

  return expectedSignature === signature;
}
