"use client";

import {
  EXECUTIVE_DECISION_STATUS_LABELS,
  type ExecutiveDecisionRecord,
} from "@/lib/discussion/strategyRoomTypes";

const STATUS_STYLE: Record<ExecutiveDecisionRecord["status"], string> = {
  agreed: "text-success",
  open_question: "text-warning",
  rejected: "text-danger",
};

export function ExecutiveDecisionLog({ decisions }: { decisions: ExecutiveDecisionRecord[] }) {
  if (!decisions.length) {
    return (
      <div className="rounded-lg border border-border/60 bg-surface/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Executive Decision Log
        </p>
        <p className="mt-2 text-xs text-muted">
          Mark CEO messages as Agreed, Open Question, or Rejected to build the decision register.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
        Executive Decision Log
      </p>
      <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
        {[...decisions].reverse().map((d) => (
          <li key={d.id} className="rounded-md border border-border/50 bg-background px-2 py-2">
            <p className="text-xs font-medium text-foreground">
              Decision #{d.number}
            </p>
            <p className="mt-1 text-xs text-foreground">{d.statement}</p>
            <p className={`mt-1 text-[11px] font-medium ${STATUS_STYLE[d.status]}`}>
              {EXECUTIVE_DECISION_STATUS_LABELS[d.status]}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">
              {new Date(d.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
