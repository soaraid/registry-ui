import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { getAppAuthEnv } from "@/lib/env";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const authEnv = getAppAuthEnv();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grain opacity-90" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-4 py-10 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-6">
          <Badge className="w-fit bg-emerald-400/10 text-emerald-200">Private registry access</Badge>
          <div className="space-y-4">
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="h-7 w-7 text-emerald-300" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Manage and inspect your custom registry with a simpler UI.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Sign in to browse repositories, inspect manifests, and clean up tags from one place. The
              app session protects UI access while registry requests stay on the server.
            </p>
          </div>
        </div>

        <LoginForm
          authEnabled={authEnv.enabled}
          defaultUsername={authEnv.username}
          nextPath={resolvedSearchParams.next}
        />
      </div>
    </div>
  );
}
