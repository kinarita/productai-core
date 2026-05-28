"use client";

import { ApprovalBadge } from "@/components/orchestration/ApprovalBadge";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { RiskIndicator } from "@/components/orchestration/RiskIndicator";
import type { AIProposal, ExecutionPlan } from "@/lib/orchestration/policy/policyTypes";
import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import { canCreateExecutionTicket } from "@/lib/orchestration/execution/executionHandoff";
import { Check, FileText, Package, RotateCcw, X } from "lucide-react";

interface ProposalCardProps {
  proposal: AIProposal;
  executionPlan?: ExecutionPlan;
  executionTicket?: ExecutionTicket;
  onApprove: () => void;
  onRevision: () => void;
  onReject: () => void;
  onGeneratePlan?: () => void;
  onCreateExecutionTicket?: () => void;
  planLoading?: boolean;
}

function statusLabel(status: AIProposal["status"]) {
  return status.replaceAll("_", " ");
}

export function ProposalCard({
  proposal,
  executionPlan,
  onApprove,
  onRevision,
  onReject,
  onGeneratePlan,
  onCreateExecutionTicket,
  planLoading,
  executionTicket,
}: ProposalCardProps) {
  const handoffEligibility = canCreateExecutionTicket(proposal, executionPlan);
  const resolved =
    proposal.status === "approved" ||
    proposal.status === "rejected" ||
    proposal.status === "revision_requested" ||
    proposal.status === "execution_planned";

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {proposal.sourceAgent} · {proposal.proposalType.replaceAll("_", " ")}
          </p>
          <h4 className="mt-1 text-sm font-semibold text-foreground">{proposal.summary}</h4>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ApprovalBadge required={proposal.requiresCEOApproval} />
          <span className="text-xs capitalize text-muted">{statusLabel(proposal.status)}</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">{proposal.rationale}</p>

      <div className="mt-3">
        <RiskIndicator level={proposal.risk.level} factors={proposal.risk.factors} />
      </div>

      {proposal.governanceNote ? (
        <div className="mt-3">
          <GovernanceNote>{proposal.governanceNote}</GovernanceNote>
        </div>
      ) : null}

      {!resolved ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <Check className="h-3.5 w-3.5" />
            Approve Proposal
          </button>
          <button
            type="button"
            onClick={onRevision}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Request Revision
          </button>
          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface"
          >
            <X className="h-3.5 w-3.5" />
            Reject Proposal
          </button>
        </div>
      ) : null}

      {proposal.status === "approved" && onGeneratePlan ? (
        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            disabled={planLoading}
            onClick={onGeneratePlan}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-indigo-50 disabled:opacity-60"
          >
            <FileText className="h-3.5 w-3.5" />
            Generate Execution Plan
          </button>
        </div>
      ) : null}

      {executionPlan ? (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Execution plan (advisory)</p>
          <p className="text-sm text-foreground">{executionPlan.summary}</p>
          <ul className="space-y-1 text-sm text-muted">
            {executionPlan.proposedTasks.map((task) => (
              <li key={task.title}>
                · <span className="text-foreground">{task.title}</span> — {task.assignedRole}
              </li>
            ))}
          </ul>
          <GovernanceNote>{executionPlan.governanceNote}</GovernanceNote>
        </div>
      ) : null}

      {proposal.status === "execution_planned" && executionPlan && !executionTicket && onCreateExecutionTicket ? (
        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            disabled={!handoffEligibility.allowed}
            onClick={onCreateExecutionTicket}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Package className="h-3.5 w-3.5" />
            Create Execution Ticket
          </button>
          <p className="mt-2 text-xs text-muted">{handoffEligibility.reason}</p>
        </div>
      ) : null}

      {executionTicket ? (
        <p className="mt-3 text-xs text-muted">
          {executionTicket.status === "handoff_approved"
            ? "Execution handoff authorized. No autonomous execution was initiated."
            : executionTicket.status === "cancelled"
              ? "Execution handoff was rejected."
              : "Execution handoff is pending executive approval."}
        </p>
      ) : null}
    </article>
  );
}