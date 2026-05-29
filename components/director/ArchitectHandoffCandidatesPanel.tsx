"use client";

import Link from "next/link";
import type { ArchitectHandoffCandidate } from "@/lib/director/directorAnalysis";

export function ArchitectHandoffCandidatesPanel({
  candidates,
  compact = false,
}: {
  candidates: ArchitectHandoffCandidate[];
  compact?: boolean;
}) {
  if (!candidates.length) {
    return (
      <p className="text-xs text-muted">
        No Architect handoff candidates yet—planning artifacts must reach readiness first.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {candidates.map((c) => (
        <li key={c.missionId} className="rounded-lg border border-border px-3 py-2 text-xs">
          <p className="font-medium text-foreground">{c.missionName}</p>
          <p className="mt-1 text-muted">
            <span className="text-[10px] uppercase">Objective</span> {c.objective.slice(0, 120)}
            {c.objective.length > 120 ? "…" : ""}
          </p>
          <p className="mt-1 text-muted">
            <span className="text-[10px] uppercase">Scope</span> {c.scope.slice(0, 100)}
            {c.scope.length > 100 ? "…" : ""}
          </p>
          <p className="mt-1">
            <span className="text-[10px] uppercase text-muted">Handoff Readiness</span>{" "}
            {c.handoffReadiness}
          </p>
          <Link href={c.directorHref} className="mt-2 inline-block text-accent hover:underline">
            Director Workspace →
          </Link>
        </li>
      ))}
    </ul>
  );
}
