"use client";

import { ApprovalSignatureView } from "@/components/orchestration/ApprovalSignatureView";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { HandoffStatusBadge } from "@/components/orchestration/HandoffStatusBadge";
import { RiskIndicator } from "@/components/orchestration/RiskIndicator";
import { EXECUTION_TARGET_LABELS } from "@/lib/orchestration/execution/executionPolicy";
import type { ExecutionAuditEntry, ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import { getHandoffBoundaryMessage } from "@/lib/orchestration/execution/executionPolicy";
import { MaterializationStatusBadge } from "@/components/orchestration/MaterializationStatusBadge";
import { canMaterializeExecutionPlan, requiresMaterializationReview } from "@/lib/orchestration/materialization/materializationPolicy";
import { Check, Layers, ClipboardCheck, X } from "lucide-react";

interface ExecutionTicketCardProps {
  ticket: ExecutionTicket;
  auditEntries?: ExecutionAuditEntry[];
  materializedTaskCount?: number;
  onApproveHandoff: () => void;
  onRejectHandoff: () => void;
  onRequestMaterializationReview?: () => void;
  onMaterializeTasks?: () => void;
  materializeDisabledReason?: string;
}

export function ExecutionTicketCard({
  ticket,
  auditEntries = [],
  onApproveHandoff,
  onRejectHandoff,
  onRequestMaterializationReview,
  onMaterializeTasks,
  materializeDisabledReason,
  materializedTaskCount = 0,
}: ExecutionTicketCardProps) {
  const canAct = ticket.status === "awaiting_handoff" || ticket.status === "draft";
  const handoffApproved = ticket.status === "handoff_approved";
  const plan = ticket.executionPlan;
  const materializeCheck = canMaterializeExecutionPlan({
    ticket,
    plan,
    alreadyMaterialized: Boolean(ticket.materializedTaskIds?.length),
  });
  const needsReview = requiresMaterializationReview(ticket);

  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Execution ticket · {ticket.executionTarget}
          </p>
          <h4 className="mt-1 text-sm font-semibold text-foreground">{ticket.executionIntent}</h4>
          <p className="mt-1 text-xs text-muted">
            {EXECUTION_TARGET_LABELS[ticket.executionTarget]}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <HandoffStatusBadge status={ticket.status} />
          <MaterializationStatusBadge status={ticket.materializationStatus} />
        </div>
      </div>

      <div className="mt-3">
        <RiskIndicator level={ticket.riskLevel} />
      </div>

      <p className="mt-2 text-xs text-muted">
        Prepared by {ticket.createdBy}
        {ticket.approvedBy ? ` · Authorized by ${ticket.approvedBy}` : null}
      </p>

      {plan ? (
        <div className="mt-4 space-y-2 rounded-lg border border-border bg-background p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Linked execution plan
          </p>
          <p className="text-sm text-foreground">{plan.summary}</p>
          <ul className="space-y-1 text-sm text-muted">
            {plan.proposedTasks.map((task) => (
              <li key={task.title}>
                · <span className="text-foreground">{task.title}</span> — {task.assignedRole}
              </li>
            ))}
          </ul>
          {plan.dependencyNotes.length > 0 ? (
            <p className="text-xs text-muted">Dependencies: {plan.dependencyNotes.join(" ")}</p>
          ) : null}
          {plan.reviewRequirements.length > 0 ? (
            <p className="text-xs text-muted">Review: {plan.reviewRequirements[0]}</p>
          ) : null}
          {plan.qaCheckpoints.length > 0 ? (
            <p className="text-xs text-muted">QA: {plan.qaCheckpoints[0]}</p>
          ) : null}
          {plan.runtimeConsiderations.length > 0 ? (
            <p className="text-xs text-muted">Runtime: {plan.runtimeConsiderations[0]}</p>
          ) : null}
          <GovernanceNote>{plan.governanceNote}</GovernanceNote>
        </div>
      ) : null}

      <div className="mt-3">
        <GovernanceNote>{getHandoffBoundaryMessage()}</GovernanceNote>
      </div>

      {ticket.approvalSignature ? (
        <div className="mt-3">
          <ApprovalSignatureView signature={ticket.approvalSignature} />
        </div>
      ) : null}

      {handoffApproved && ticket.materializationStatus === "execution_ready" ? (
        <p className="mt-3 text-xs text-muted">
          {materializedTaskCount} execution-ready operational task
          {materializedTaskCount === 1 ? "" : "s"} prepared under governance review.
        </p>
      ) : null}

      {handoffApproved && onMaterializeTasks ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {needsReview && ticket.materializationStatus !== "materialization_requested" && onRequestMaterializationReview ? (
            <button
              type="button"
              onClick={onRequestMaterializationReview}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              Request Materialization Review
            </button>
          ) : null}
          <button
            type="button"
            disabled={
              Boolean(materializeDisabledReason) ||
              (!materializeCheck.allowed && ticket.materializationStatus !== "materialization_requested")
            }
            onClick={onMaterializeTasks}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Layers className="h-3.5 w-3.5" />
            Materialize Tasks
          </button>
          {materializeDisabledReason || !materializeCheck.allowed ? (
            <p className="w-full text-xs text-muted">
              {materializeDisabledReason ?? materializeCheck.reason}
            </p>
          ) : null}
        </div>
      ) : null}

      {canAct ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onApproveHandoff}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <Check className="h-3.5 w-3.5" />
            Approve Handoff
          </button>
          <button
            type="button"
            onClick={onRejectHandoff}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface"
          >
            <X className="h-3.5 w-3.5" />
            Reject Handoff
          </button>
        </div>
      ) : null}

      {auditEntries.length > 0 ? (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Audit trail</p>
          <ul className="mt-2 space-y-1">
            {auditEntries.slice(0, 4).map((entry) => (
              <li key={entry.id} className="text-xs text-muted">
                <span className="text-foreground">{entry.actor}</span> — {entry.message}
                <span className="ml-1">· {entry.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}