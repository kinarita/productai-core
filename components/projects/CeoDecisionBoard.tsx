"use client";

import {
  normalizeDecisionStatus,
  isAwaitingCeoDecision,
} from "@/lib/discussion/decisionCandidateStatus";
import {
  AGENT_VOTE_LABELS,
  DECISION_STATUS_LABELS,
  voteEmoji,
  type DecisionCandidateStatus,
  type DecisionItem,
} from "@/lib/discussion/decisionGovernanceTypes";

export function CeoDecisionBoard({
  decisions,
  onCeoDecision,
  onProposeBriefChange,
  busy,
}: {
  decisions: DecisionItem[];
  onCeoDecision: (decisionId: string, status: DecisionCandidateStatus) => void;
  onProposeBriefChange: (decisionId: string) => void;
  busy?: boolean;
}) {
  const awaiting = decisions.filter(isAwaitingCeoDecision);
  const approved = decisions.filter((d) => {
    const s = normalizeDecisionStatus(d);
    return s === "approved" || s === "applied_to_brief";
  });

  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
        Decisions Awaiting CEO
      </p>
      {awaiting.length === 0 && approved.length === 0 ? (
        <p className="mt-2 text-xs text-muted">
          Proposed changes register as decision candidates automatically.
        </p>
      ) : null}
      <ul className="mt-2 max-h-64 space-y-3 overflow-y-auto">
        {awaiting.map((d) => (
          <li key={d.id} className="rounded-md border border-border/60 bg-background px-2 py-2">
            <p className="text-xs font-medium text-foreground">{d.title}</p>
            <p className="mt-1 text-[11px] text-muted line-clamp-2">{d.rationale}</p>
            <div className="mt-2 space-y-0.5 text-[11px] text-muted">
              <p>
                Planner {voteEmoji(d.plannerVote)} {AGENT_VOTE_LABELS[d.plannerVote]}
              </p>
              <p>
                COO {voteEmoji(d.cooVote)} {AGENT_VOTE_LABELS[d.cooVote]}
              </p>
              <p className="font-medium text-foreground">
                Status: {DECISION_STATUS_LABELS[normalizeDecisionStatus(d)]}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => onCeoDecision(d.id, "approved")}
                className="rounded border border-success/40 px-2 py-0.5 text-[10px] text-success hover:bg-success/10 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onCeoDecision(d.id, "rejected")}
                className="rounded border border-danger/40 px-2 py-0.5 text-[10px] text-danger hover:bg-danger/10 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onCeoDecision(d.id, "on_hold")}
                className="rounded border border-warning/40 px-2 py-0.5 text-[10px] text-warning hover:bg-warning/10 disabled:opacity-50"
              >
                Need Discussion
              </button>
            </div>
          </li>
        ))}
        {approved.map((d) => (
          <li
            key={d.id}
            className="rounded-md border border-success/30 bg-emerald-50/40 px-2 py-2"
          >
            <p className="text-xs font-medium text-success">✓ {d.title}</p>
            <p className="mt-1 text-[11px] text-muted">Approved — ready for Brief path</p>
            {d.sourceProposalId ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onProposeBriefChange(d.id)}
                className="mt-2 rounded bg-accent px-2 py-1 text-[10px] font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Create Brief Change Candidate
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
