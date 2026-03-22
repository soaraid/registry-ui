"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  authEnabled: boolean;
  defaultUsername?: string;
  nextPath?: string;
}

export function LoginForm({ authEnabled, defaultUsername, nextPath = "/" }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState(defaultUsername ?? "");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authEnabled) {
      setErrorMessage("App auth is not configured. Set APP_AUTH_USERNAME, APP_AUTH_PASSWORD, and APP_SESSION_SECRET.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(payload?.error ?? "Unable to sign in.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-black/35 shadow-glow backdrop-blur-2xl">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 text-emerald-200">
          <LockKeyhole className="h-4 w-4" />
          Protected session
        </CardDescription>
        <CardTitle className="text-3xl tracking-tight">Sign in to Registry UI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="username">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="operator"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-50">
              {errorMessage}
            </div>
          ) : null}

          <Button className="w-full gap-2" type="submit" disabled={isPending}>
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-muted-foreground">
          This app uses one env-configured account for now. Role-based permissions can be added later without
          changing the registry proxy layer.
        </div>
      </CardContent>
    </Card>
  );
}
