"use client";

import Link from "next/link";
import type { HandoffLineageContextItem } from "@/lib/lineage/artifactLineageAnalysis";

export function ArtifactLineageHandoffPanel({
  items,
  compact = false,
}: {
  items: HandoffLineageContextItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-muted">No artifact lineage handoff context available.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.slice(0, compact ? 3 : undefined).map((item) => (
        <li key={item.missionId} className="rounded-lg border border-border px-3 py-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/missions/${item.missionId}`} className="font-medium text-accent hover:underline">
              {item.missionName}
            </Link>
            <Link href={item.lineageHref} className="text-[10px] text-muted hover:text-accent">
              Lineage
            </Link>
          </div>
          <p className="mt-1 text-muted">
            {item.sourceArtifact} → {item.destinationArtifact}
          </p>
        </li>
      ))}
    </ul>
  );
}
