"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export function MissionDetailSkeleton() {
  return (
    <AppShell>
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-surface" />
      <div className="mb-8 space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-surface" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-surface" />
        <div className="h-4 w-48 animate-pulse rounded bg-surface" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-xl bg-surface lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-xl bg-surface" />
      </div>
    </AppShell>
  );
}
