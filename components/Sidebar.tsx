"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  agentFirstAdvancedNavItems,
  agentFirstNavItems,
} from "@/lib/agent-first/agentFirstNav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
          PA
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">ProductAI</p>
          <p className="text-xs text-muted">AI Team OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {agentFirstNavItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-surface hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-wide text-muted">
            Advanced
          </p>
          <div className="space-y-0.5">
            {agentFirstAdvancedNavItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface font-medium text-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="leading-tight">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <p className="text-xs text-muted">AI team operational</p>
        </div>
      </div>
    </aside>
  );
}
