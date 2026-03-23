import { ShieldCheck } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
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
      <div className="app-spotlight pointer-events-none fixed inset-x-0 top-0 h-72" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-4 py-10 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <ThemeToggle />
        </div>
        <div className="max-w-xl space-y-6">
          <Badge className="w-fit border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
            Private registry access
          </Badge>
          <div className="space-y-4">
            <div className="soft-panel inline-flex rounded-2xl p-4">
              <ShieldCheck className="h-7 w-7 text-emerald-700 dark:text-emerald-300" />
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
