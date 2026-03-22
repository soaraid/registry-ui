"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav } from "@/components/sidebar-nav";
import { Badge } from "@/components/ui/badge";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grain opacity-90" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden w-[300px] shrink-0 pr-6 lg:block">
          <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/30 p-5 shadow-glow backdrop-blur-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Soara</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">Registry UI</h1>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
            </div>

            <div className="mb-6">
              <Badge className="mb-3 w-fit bg-emerald-400/10 text-emerald-200">Docker V2 Proxy</Badge>
              <p className="text-sm leading-6 text-muted-foreground">
                A control surface for browsing, inspecting, and managing a private registry without
                exposing the raw API to the browser.
              </p>
            </div>

            <SidebarNav />

            <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Design Tone</p>
              <p className="mt-2 text-sm text-foreground">Dark zinc surfaces, restrained glow, and fast operator workflows.</p>
            </div>

            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 space-y-4 lg:hidden">
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-5 shadow-glow backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Soara</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight">Registry UI</h1>
                </div>
                <Badge className="bg-emerald-400/10 text-emerald-200">Docker V2 Proxy</Badge>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/30 p-4 shadow-glow backdrop-blur-2xl">
              <SidebarNav />
            </div>
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-4 shadow-glow backdrop-blur-2xl">
              <LogoutButton />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-4 shadow-glow backdrop-blur-2xl md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
