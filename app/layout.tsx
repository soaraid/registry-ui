import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import { getAppBrandEnv } from "@/lib/env";
import "@/app/globals.css";

const branding = getAppBrandEnv();
const themeBootstrapScript = `
(() => {
  try {
    const storageKey = "soaraid-registry-ui-theme";
    const savedTheme = window.localStorage.getItem(storageKey);
    const root = document.documentElement;
    const theme = savedTheme === "light" ? "light" : "dark";
    if (theme === "light") {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    } else {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    }
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export const metadata: Metadata = {
  title: branding.displayName,
  description: "Modern Docker Registry UI built with Next.js 15 and Shadcn UI patterns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <AppShell branding={branding}>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
