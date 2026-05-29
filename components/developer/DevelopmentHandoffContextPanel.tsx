"use client";

import Link from "next/link";
import type { DevelopmentHandoffContextItem } from "@/lib/developer/developerAnalysis";

export function DevelopmentHandoffContextPanel({
  items,
}: {
  items: DevelopmentHandoffContextItem[];
}) {
  if (!items.length) {
    return (
      <p className="text-xs text-muted">
        No development handoff context yet—complete design review in Designer Workspace first.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.missionId} className="rounded-lg border border-border px-3 py-2 text-xs">
          <p className="font-medium text-foreground">{item.missionName}</p>
          <p className="mt-1 text-muted">
            <span className="text-[10px] uppercase">User Flow</span> {item.userFlowTitle}
          </p>
          <p className="mt-1 text-muted">
            <span className="text-[10px] uppercase">Design Specification</span>{" "}
            {item.designSpecificationTitle}
          </p>
          <p className="mt-1">
            <span className="text-[10px] uppercase text-muted">Development Readiness</span>{" "}
            {item.developmentReadiness}
          </p>
          <Link href={item.developerHref} className="mt-2 inline-block text-accent hover:underline">
            Open Developer Workspace →
          </Link>
        </li>
      ))}
    </ul>
  );
}
