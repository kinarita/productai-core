import type { AIProposal, ApprovalRequirement } from "@/lib/orchestration/policy/policyTypes";

const CEO_REQUIRED_TYPES = new Set<AIProposal["proposalType"]>([
  "architecture_change",
  "release_decision",
  "dependency_escalation",
  "runtime_recovery",
]);

const CEO_REQUIRED_KEYWORDS = [
  "architecture",
  "release",
  "partition",
  "escalation",
  "recovery",
  "schema",
  "production rollout",
];

export function requiresCEOApproval(
  proposal: Pick<AIProposal, "proposalType" | "summary" | "risk">
): ApprovalRequirement {
  if (CEO_REQUIRED_TYPES.has(proposal.proposalType)) {
    return {
      requiresCEOApproval: true,
      reason: "Executive approval is required for architecture, release, or escalation decisions.",
    };
  }

  const text = `${proposal.proposalType} ${proposal.summary}`.toLowerCase();
  if (CEO_REQUIRED_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return {
      requiresCEOApproval: true,
      reason: "Proposal touches architecture, release, or operational escalation scope.",
    };
  }

  if (proposal.risk.level === "high") {
    return {
      requiresCEOApproval: true,
      reason: "High operational risk requires executive review before planning proceeds.",
    };
  }

  return {
    requiresCEOApproval: false,
    reason: "Informational proposal; no executive gate required.",
  };
}

export { requiresExecutionHandoffApproval } from "@/lib/orchestration/execution/executionPolicy";