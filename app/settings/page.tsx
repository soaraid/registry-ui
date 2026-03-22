import { getAppAuthEnv, getRegistryEnv } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const envRows = [
  ["REGISTRY_URL", "Base URL of the Docker Registry V2 instance."],
  ["REGISTRY_USERNAME", "Optional username for Basic auth or token exchange."],
  ["REGISTRY_PASSWORD", "Optional password for Basic auth or token exchange."],
  ["REGISTRY_BEARER_TOKEN", "Optional static bearer token for pre-issued registry auth."],
  ["APP_AUTH_USERNAME", "Optional single-user username for this UI."],
  ["APP_AUTH_PASSWORD", "Optional single-user password for this UI."],
  ["APP_SESSION_SECRET", "Optional HMAC secret used to sign login session cookies."],
];

export default function SettingsPage() {
  const appAuthEnv = getAppAuthEnv();
  let resolvedConnection: { host: string; authMode: string } | null = null;

  try {
    const registryEnv = getRegistryEnv();
    resolvedConnection = {
      host: new URL(registryEnv.url).host,
      authMode: registryEnv.authMode,
    };
  } catch {
    resolvedConnection = null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge className="w-fit">Settings</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">Registry connection model</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Authentication and CORS handling stay on the server through route handlers under
          `app/api/registry`.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Resolved connection</CardDescription>
          <CardTitle>Current runtime mode</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Registry host</p>
            <p className="mt-2 text-sm text-foreground">{resolvedConnection?.host ?? "Not configured"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Auth mode</p>
            <p className="mt-2 text-sm capitalize text-foreground">
              {resolvedConnection?.authMode ?? "Unavailable until env is set"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">App session auth</p>
            <p className="mt-2 text-sm text-foreground">{appAuthEnv.enabled ? "Enabled" : "Disabled"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Environment contract</CardDescription>
          <CardTitle>Supported auth configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {envRows.map(([key, description], index) => (
            <div key={key}>
              {index > 0 ? <Separator className="mb-4" /> : null}
              <div className="space-y-1">
                <code className="text-sm text-foreground">{key}</code>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
