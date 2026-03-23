"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    caption: "Overview & quick start",
  },
  {
    href: "/repositories",
    label: "Repositories",
    icon: Boxes,
    caption: "Catalog explorer",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    caption: "Registry connection",
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-200",
              isActive
                ? "border-border/70 bg-accent/75 text-foreground shadow-[0_0_0_1px_hsl(var(--border)/0.55)]"
                : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-accent/55 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "mt-0.5 rounded-xl border p-2 transition-colors",
                isActive
                  ? "border-border/70 bg-card/85 text-foreground"
                  : "border-border/60 bg-card/70 text-muted-foreground group-hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
            </span>
            <span className="space-y-1">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs text-muted-foreground">{item.caption}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
