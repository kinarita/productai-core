"use client";

import Link from "next/link";
import type { ArchitectHandoffContextItem } from "@/lib/architect/architectAnalysis";

export function ArchitectHandoffContextPanel({
  items,
}: {
  items: ArchitectHandoffContextItem[];
}) {
  if (!items.length) {
    return (
      <p className="text-xs text-muted">
        No Architect handoff context yet—complete Director planning and readiness first.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.missionId} className="rounded-lg border border-border px-3 py-2 text-xs">
          <p className="font-medium text-foreground">{item.missionName}</p>
          <p className="mt-1 text-muted">{item.objective.slice(0, 120)}…</p>
          <p className="mt-1">
            <span className="text-[10px] uppercase text-muted">Handoff Readiness</span>{" "}
            {item.handoffReadiness}
          </p>
          <Link href={item.architectHref} className="mt-2 inline-block text-accent hover:underline">
            Open Architect Workspace →
          </Link>
        </li>
      ))}
    </ul>
  );
}
