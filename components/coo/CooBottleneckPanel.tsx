"use client";

import Link from "next/link";
import type { CooBottleneckObservation } from "@/lib/coo/cooBottleneckDetection";
import { Badge } from "@/components/Badge";
import { cooStageLabel } from "@/lib/coo/cooWorkspace";

export function CooBottleneckPanel({
  bottlenecks,
  compact = false,
}: {
  bottlenecks: CooBottleneckObservation[];
  compact?: boolean;
}) {
  if (bottlenecks.length === 0) {
    return (
      <p className="text-xs text-muted">
        No potential bottlenecks observed. Rule-based detection only—review suggested when patterns appear.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {bottlenecks.slice(0, compact ? 3 : undefined).map((item) => (
        <li
          key={item.id}
          className="rounded-lg border border-border bg-background px-3 py-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={item.severity === "review_suggested" ? "warning" : "default"}>
              {item.label}
            </Badge>
            <span className="text-[10px] uppercase text-muted">{cooStageLabel(item.stage)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{item.detail}</p>
          <Link
            href={`/missions/${item.missionId}`}
            className="mt-1 inline-block text-xs text-accent hover:underline"
          >
            {item.missionName}
          </Link>
        </li>
      ))}
    </ul>
  );
}
