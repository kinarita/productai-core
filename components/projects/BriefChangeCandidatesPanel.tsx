"use client";

import type { BriefChangeCandidate } from "@/lib/discussion/decisionGovernanceTypes";

export function BriefChangeCandidatesPanel({
  candidates,
  onCommit,
  busy,
}: {
  candidates: BriefChangeCandidate[];
  onCommit: (candidateId: string) => void;
  busy?: boolean;
}) {
  const approved = candidates.filter((c) => c.status === "approved");

  if (!approved.length) return null;

  return (
    <div className="rounded-lg border border-accent/25 bg-indigo-50/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Approved Brief Changes
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Commit only after CEO approved the underlying decision.
      </p>
      <ul className="mt-2 space-y-2">
        {approved.map((c) => (
          <li key={c.id} className="rounded-md border border-border bg-background px-2 py-2">
            <p className="text-xs font-medium text-foreground">{c.title}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => onCommit(c.id)}
              className="mt-2 rounded-lg bg-success px-3 py-1 text-[10px] font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Commit to Brief
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
