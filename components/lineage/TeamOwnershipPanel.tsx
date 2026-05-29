"use client";

import type { TeamOwnershipRow } from "@/lib/lineage/teamOwnership";

export function TeamOwnershipPanel({ rows }: { rows: TeamOwnershipRow[] }) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.stepId} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
          <span className="font-medium text-foreground">{row.artifactName}</span>
          <span className="text-muted">→ {row.ownerRoleLabel}</span>
        </li>
      ))}
      <p className="text-[10px] text-muted">Ownership is for accountability reading—not automatic delegation.</p>
    </ul>
  );
}
