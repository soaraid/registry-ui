import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/components/query-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "soara/registry-ui",
  description: "Modern Docker Registry UI built with Next.js 15 and Shadcn UI patterns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
