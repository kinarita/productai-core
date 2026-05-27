"use client";

import { Bell, Search } from "lucide-react";
import { organizationHealth, organizationSettings } from "@/data/mockData";

export function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-6 border-b border-border bg-background px-8">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search missions, tasks, decisions…"
          className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          readOnly
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-2 text-sm md:flex">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-muted">AI org</span>
          <span className="font-medium text-foreground">active</span>
        </div>

        <div className="hidden text-sm sm:block">
          <span className="text-muted">Missions</span>{" "}
          <span className="font-semibold text-foreground">
            {organizationHealth.activeMissions} active
          </span>
        </div>

        <button
          type="button"
          className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 border-l border-border pl-6">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">
              {organizationSettings.ceoName}
            </p>
            <p className="text-xs text-muted">CEO</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
            {organizationSettings.ceoName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
      </div>
    </header>
  );
}
