import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { ExecutionPlan } from "@/lib/orchestration/policy/policyTypes";

export interface MaterializationValidation {
  allowed: boolean;
  reason: string;
}

export function canMaterializeExecutionPlan(input: {
  ticket: ExecutionTicket;
  plan?: ExecutionPlan;
  syncWarningCount?: number;
  runtimeAlertCount?: number;
  alreadyMaterialized?: boolean;
}): MaterializationValidation {
  const { ticket, plan, syncWarningCount = 0, runtimeAlertCount = 0, alreadyMaterialized } = input;

  if (alreadyMaterialized) {
    return { allowed: false, reason: "Operational tasks were already materialized for this handoff." };
  }

  if (ticket.status !== "handoff_approved") {
    return {
      allowed: false,
      reason: "Execution handoff must be approved before materialization.",
    };
  }

  if (!ticket.approvalSignature) {
    return {
      allowed: false,
      reason: "Governance signature is required before materialization.",
    };
  }

  if (!plan && !ticket.executionPlan) {
    return {
      allowed: false,
      reason: "An execution plan must be linked before tasks can be materialized.",
    };
  }

  if (syncWarningCount >= 3 || runtimeAlertCount >= 2) {
    return {
      allowed: false,
      reason: "Runtime instability advisory — materialization is blocked until conditions stabilize.",
    };
  }

  if (ticket.riskLevel === "high" && ticket.materializationStatus !== "materialization_requested") {
    return {
      allowed: false,
      reason: "High-risk handoff requires materialization review before task generation.",
    };
  }

  return {
    allowed: true,
    reason: "Handoff approved with governance signature; materialization may proceed.",
  };
}

export function validateMaterializationBoundary(): string {
  return "Materialized tasks are execution-ready operational work only. Autonomous execution, repository changes, and deploy actions remain disabled.";
}

export function requiresMaterializationReview(ticket: ExecutionTicket): boolean {
  return ticket.riskLevel === "high";
}