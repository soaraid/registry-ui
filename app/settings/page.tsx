import { getAppAuthEnv, getRegistryEnv } from "@/lib/env";
import { RegistryHealthPanel } from "@/components/settings/registry-health-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const envRows = [
  ["REGISTRY_URL", "Address of the registry this UI should connect to."],
  ["REGISTRY_USERNAME", "Optional username for registry sign-in or token exchange."],
  ["REGISTRY_PASSWORD", "Optional password for registry sign-in or token exchange."],
  ["REGISTRY_BEARER_TOKEN", "Optional bearer token if your registry already gives you one."],
  ["APP_AUTH_USERNAME", "Optional single-user username for this UI."],
  ["APP_AUTH_PASSWORD", "Optional single-user password for this UI."],
  ["APP_SESSION_SECRET", "Optional secret used to sign the UI login session cookie."],
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
        <h2 className="text-3xl font-semibold tracking-tight">Registry connection settings</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          The browser talks to the registry through server-side routes, so auth and CORS handling stay
          on the server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Current connection</CardDescription>
          <CardTitle>Runtime status</CardTitle>
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

      <RegistryHealthPanel />

      <Card>
        <CardHeader>
          <CardDescription>Environment variables</CardDescription>
          <CardTitle>Supported configuration</CardTitle>
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
