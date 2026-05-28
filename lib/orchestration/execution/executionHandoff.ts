import type { AIProposal, ExecutionPlan } from "@/lib/orchestration/policy/policyTypes";
import type { ApprovalSignature, ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import {
  inferExecutionTarget,
  requiresExecutionHandoffApproval,
} from "@/lib/orchestration/execution/executionPolicy";
import { getExecutionAdapter } from "@/lib/orchestration/execution/executionAdapters";

function makeTicketId() {
  return `ticket-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function buildExecutionTicketDraft(input: {
  proposal: AIProposal;
  executionPlan?: ExecutionPlan;
  createdBy?: string;
}): Omit<ExecutionTicket, "id" | "createdAt"> {
  const { proposal, executionPlan } = input;
  const target = inferExecutionTarget(proposal.proposalType);

  return {
    proposalId: proposal.id,
    executionPlanId: executionPlan?.id,
    missionId: proposal.missionId ?? "unknown",
    createdBy: input.createdBy ?? "Nova (COO)",
    executionTarget: target,
    executionIntent: proposal.summary,
    riskLevel: proposal.risk.level,
    status: "draft",
    executionPlan,
    approvalSignature: undefined,
  };
}

export function submitTicketForHandoff(ticket: ExecutionTicket): ExecutionTicket {
  return { ...ticket, status: "awaiting_handoff" };
}

export function createApprovalSignature(note?: string): ApprovalSignature {
  return {
    actor: "Alex Chen",
    role: "CEO",
    approvedAt: new Date().toISOString(),
    approvalType: "execution_handoff",
    governanceNote:
      note ??
      "Executive authorization recorded for execution handoff boundary only. No autonomous execution is permitted.",
  };
}

export function approveHandoff(ticket: ExecutionTicket, governanceNote?: string): ExecutionTicket {
  const signature = createApprovalSignature(governanceNote);
  const adapter = getExecutionAdapter(ticket.executionTarget);
  adapter.prepareExecution({ ...ticket, status: "handoff_approved", approvalSignature: signature });

  return {
    ...ticket,
    status: "handoff_approved",
    approvedBy: signature.actor,
    approvalSignature: signature,
  };
}

export function rejectHandoff(ticket: ExecutionTicket): ExecutionTicket {
  return { ...ticket, status: "cancelled" };
}

export function finalizeTicketIds(draft: Omit<ExecutionTicket, "id" | "createdAt">): ExecutionTicket {
  return {
    ...draft,
    id: makeTicketId(),
    createdAt: formatTime(),
  };
}

export function canCreateExecutionTicket(proposal: AIProposal, plan?: ExecutionPlan): {
  allowed: boolean;
  reason: string;
} {
  if (proposal.status !== "execution_planned" && proposal.status !== "approved") {
    return {
      allowed: false,
      reason: "Proposal must be approved with an execution plan before handoff.",
    };
  }
  if (proposal.status === "approved" && !plan) {
    return {
      allowed: false,
      reason: "Generate an execution plan before creating an execution ticket.",
    };
  }
  const handoff = requiresExecutionHandoffApproval(proposal);
  return {
    allowed: true,
    reason: handoff.reason,
  };
}