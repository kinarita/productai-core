"use client";

import Link from "next/link";
import type { QaHandoffContextItem } from "@/lib/qa/qaAnalysis";

export function QaHandoffContextPanel({
  items,
  compact = false,
}: {
  items: QaHandoffContextItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-muted">No QA handoff context available yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.slice(0, compact ? 3 : undefined).map((item) => (
        <div key={item.missionId} className="rounded-lg border border-border px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/missions/${item.missionId}`} className="text-sm font-medium text-accent hover:underline">
              {item.missionName}
            </Link>
            <Link href={item.qaHref} className="text-[10px] text-muted hover:text-accent">
              QA detail
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted">{item.implementationPlanTitle}</p>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted sm:grid-cols-3">
            <span>Tech risks: {item.technicalRiskCount}</span>
            <span>QA: {item.qaReadiness}</span>
            <span>Artifact: test_plan</span>
          </div>
        </div>
      ))}
    </div>
  );
}

