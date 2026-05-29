"use client";

import Link from "next/link";
import type { ReleaseRiskObservation } from "@/lib/release/releaseRisks";
import { Badge } from "@/components/Badge";

export function ReleaseRiskPanel({
  risks,
  compact = false,
}: {
  risks: ReleaseRiskObservation[];
  compact?: boolean;
}) {
  if (risks.length === 0) {
    return (
      <p className="text-xs text-muted">
        No release risks observed. Rule-based detection only—recommendation reading suggested when patterns appear.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {risks.slice(0, compact ? 3 : undefined).map((risk) => (
        <li key={risk.id} className="rounded-lg border border-border px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">{risk.label}</Badge>
            <span className="text-[10px] uppercase text-muted">{risk.category.replaceAll("_", " ")}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{risk.detail}</p>
          <Link href={`/missions/${risk.missionId}`} className="mt-1 inline-block text-xs text-accent hover:underline">
            {risk.missionName}
          </Link>
        </li>
      ))}
    </ul>
  );
}
