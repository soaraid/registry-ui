"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { BrandLockup } from "@/components/brand-lockup";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import type { AppBrandEnv } from "@/lib/env";

interface AppShellProps {
  branding: AppBrandEnv;
  children: ReactNode;
}

export function AppShell({ branding, children }: AppShellProps) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grain opacity-90" />
      <div className="app-spotlight pointer-events-none fixed inset-x-0 top-0 h-64" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden w-[300px] shrink-0 pr-6 lg:block">
          <div className="shell-panel sticky top-6 flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[28px] p-5">
            <div className="mb-8">
              <BrandLockup brandName={branding.brandName} productName={branding.productName} />
            </div>

            <div className="mb-6">
              <Badge className="mb-3 w-fit border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                Custom registry UI
              </Badge>
              <p className="text-sm leading-6 text-muted-foreground">
                A simpler UI for browsing, inspecting, and maintaining images in a custom registry
                without exposing the raw API to the browser.
              </p>
            </div>

            <SidebarNav />

            <div className="mt-auto flex items-center justify-between gap-3 pt-6">
              <ThemeToggle />
              <LogoutButton />
            </div>
            <p className="mt-4 px-1 text-[11px] leading-5 text-muted-foreground">
              © {currentYear} Soara ·{" "}
              <a
                href="https://github.com/soaraid"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                github.com/soaraid
              </a>
            </p>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 space-y-4 lg:hidden">
            <div className="shell-panel rounded-[28px] p-5">
              <div className="flex items-center justify-between gap-4">
                <BrandLockup brandName={branding.brandName} productName={branding.productName} compact />
                <Badge className="border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                  Custom registry UI
                </Badge>
              </div>
            </div>

            <div className="shell-panel rounded-[28px] p-4">
              <div className="mb-4 flex justify-end">
                <ThemeToggle />
              </div>
              <SidebarNav />
            </div>
            <div className="shell-panel rounded-[28px] p-4">
              <LogoutButton />
            </div>
            <div className="px-1 text-[11px] text-muted-foreground">
              © {currentYear} Soara ·{" "}
              <a
                href="https://github.com/soaraid"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                github.com/soaraid
              </a>
            </div>
          </div>

          <div className="main-panel rounded-[30px] p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
