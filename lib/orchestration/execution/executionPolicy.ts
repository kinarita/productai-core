import type { AIProposal } from "@/lib/orchestration/policy/policyTypes";
import type { ExecutionTarget } from "@/lib/orchestration/execution/executionTypes";

export interface HandoffApprovalRequirement {
  requiresHandoffApproval: boolean;
  reason: string;
}

export function requiresExecutionHandoffApproval(
  proposal: Pick<AIProposal, "proposalType" | "risk" | "requiresCEOApproval">
): HandoffApprovalRequirement {
  if (proposal.requiresCEOApproval || proposal.risk.level === "high") {
    return {
      requiresHandoffApproval: true,
      reason: "Executive handoff approval is required before any execution boundary is authorized.",
    };
  }

  if (proposal.proposalType === "architecture_change" || proposal.proposalType === "release_decision") {
    return {
      requiresHandoffApproval: true,
      reason: "Architecture and release paths require explicit execution handoff authorization.",
    };
  }

  return {
    requiresHandoffApproval: true,
    reason: "All execution handoffs require human authorization; autonomous execution remains disabled.",
  };
}

export function getHandoffBoundaryMessage(): string {
  return "Only human approval may authorize execution handoff. AI agents may propose and prepare plans but cannot execute.";
}

export function inferExecutionTarget(
  proposalType: AIProposal["proposalType"]
): ExecutionTarget {
  switch (proposalType) {
    case "runtime_recovery":
      return "RuntimeOperation";
    case "release_decision":
      return "GitHub";
    case "architecture_change":
      return "InternalAgent";
    case "dependency_escalation":
      return "ClaudeCode";
    default:
      return "MCP";
  }
}

export const EXECUTION_TARGET_LABELS: Record<ExecutionTarget, string> = {
  MCP: "MCP integration boundary",
  GitHub: "GitHub repository boundary",
  ClaudeCode: "Claude Code execution boundary",
  InternalAgent: "Internal agent orchestration boundary",
  RuntimeOperation: "Runtime operational boundary",
};