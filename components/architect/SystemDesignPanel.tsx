"use client";

import type { SystemDesignArea } from "@/lib/architect/systemDesign";

export function SystemDesignPanel({ areas }: { areas: SystemDesignArea[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {areas.map((area) => (
        <div key={area.id} className="rounded-lg border border-border px-3 py-2 text-xs">
          <p className="font-medium text-foreground">{area.label}</p>
          <p className="mt-1 text-muted">{area.summary}</p>
        </div>
      ))}
    </div>
  );
}
