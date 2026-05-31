"use client";

import {
  AGENT_VOTE_LABELS,
  DECISION_STATUS_LABELS,
  voteEmoji,
  type DecisionCandidateStatus,
  type DecisionItem,
} from "@/lib/discussion/decisionGovernanceTypes";
import { isAwaitingCeoDecision } from "@/lib/discussion/decisionCandidateStatus";
import { PRODUCT_PLANNER_DISPLAY_NAME } from "@/lib/discussion/executiveRoomLabels";
import { PendingDecisionsBanner } from "@/components/projects/PendingDecisionsBanner";

export function DecisionCandidatesList({
  decisions,
  busy,
  onCeoDecision,
}: {
  decisions: DecisionItem[];
  busy?: boolean;
  onCeoDecision: (decisionId: string, status: DecisionCandidateStatus) => void;
}) {
  const pending = decisions.filter(isAwaitingCeoDecision);

  if (!pending.length) return null;

  return (
    <section aria-label="Decision candidates" className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
        判断が必要な論点
      </p>
      <div className="mt-2 mb-4">
        <PendingDecisionsBanner pendingCount={pending.length} />
      </div>
      <div className="space-y-3">
      {pending.map((d) => (
        <DecisionCandidateCard
          key={d.id}
          decision={d}
          busy={busy}
          onCeoDecision={onCeoDecision}
        />
      ))}
      </div>
    </section>
  );
}

function DecisionCandidateCard({
  decision: d,
  busy,
  onCeoDecision,
}: {
  decision: DecisionItem;
  busy?: boolean;
  onCeoDecision: (decisionId: string, status: DecisionCandidateStatus) => void;
}) {
  return (
    <article className="rounded-lg border border-accent/25 bg-indigo-50/25 px-4 py-3">
      <p className="text-sm font-semibold text-foreground">{d.title}</p>

      <div className="mt-3 space-y-2 text-xs">
        <VoteRow
          role={PRODUCT_PLANNER_DISPLAY_NAME}
          vote={d.plannerVote}
          rationale={d.plannerRationale}
        />
        <VoteRow role="COO" vote={d.cooVote} rationale={d.cooRationale} />
        <p className="text-foreground">
          <span className="font-medium">CEO:</span>{" "}
          <span className="text-muted">Pending</span>
        </p>
      </div>

      <div className="mt-3">
        <p className="mb-2 text-[11px] font-medium text-muted">CEO Decision</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onCeoDecision(d.id, "approved")}
            className="rounded-lg border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 disabled:opacity-50"
          >
            採用
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onCeoDecision(d.id, "on_hold")}
            className="rounded-lg border border-warning/40 bg-amber-50/50 px-3 py-1.5 text-xs font-medium text-warning hover:bg-amber-50 disabled:opacity-50"
          >
            保留
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onCeoDecision(d.id, "rejected")}
            className="rounded-lg border border-danger/40 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            却下
          </button>
        </div>
      </div>
    </article>
  );
}

function VoteRow({
  role,
  vote,
  rationale,
}: {
  role: string;
  vote: DecisionItem["plannerVote"];
  rationale?: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/80 px-2 py-1.5">
      <p className="font-medium text-foreground">
        {role}: {voteEmoji(vote)} {AGENT_VOTE_LABELS[vote]}
      </p>
      {rationale ? (
        <p className="mt-1 text-muted">
          <span className="text-foreground/80">理由:</span> {rationale}
        </p>
      ) : null}
    </div>
  );
}
