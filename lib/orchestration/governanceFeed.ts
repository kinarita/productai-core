import type { AIProposal, ProposalStatus } from "@/lib/orchestration/policy/policyTypes";

export function governanceFeedMessage(
  action:
    | "proposal_created"
    | "approval_requested"
    | "approved"
    | "revision_requested"
    | "rejected"
    | "execution_planned"
    | "runtime_recommendation"
    | "handoff_prepared"
    | "handoff_approved"
    | "handoff_rejected",
  proposal?: Pick<AIProposal, "summary" | "sourceAgent" | "proposalType">
): string {
  switch (action) {
    case "proposal_created":
      return `${proposal?.sourceAgent ?? "COO"} submitted a structured proposal for executive review: ${proposal?.summary ?? "operational planning"}.`;
    case "approval_requested":
      return `COO requested approval for execution planning: ${proposal?.summary ?? "pending proposal"}.`;
    case "approved":
      return `CEO approved proposal: ${proposal?.summary ?? "operational path"} — execution planning may proceed.`;
    case "revision_requested":
      return `CEO requested revision on proposal: ${proposal?.summary ?? "operational path"}.`;
    case "rejected":
      return `CEO rejected proposal: ${proposal?.summary ?? "operational path"} — no execution planning will proceed.`;
    case "execution_planned":
      return `Execution plan drafted for ${proposal?.summary ?? "approved proposal"} (advisory only; tasks are not created automatically).`;
    case "runtime_recommendation":
      return "Runtime Observer recommended retry stabilization — executive review required before any recovery action.";
    case "handoff_prepared":
      return `COO prepared execution handoff for ${proposal?.summary ?? "approved plan"} — executive approval is pending.`;
    case "handoff_approved":
      return `CEO approved execution boundary for ${proposal?.summary ?? "handoff request"}. No autonomous execution was initiated.`;
    case "handoff_rejected":
      return `CEO rejected execution handoff for ${proposal?.summary ?? "handoff request"}.`;
    default:
      return "Governance event recorded.";
  }
}

export function feedTypeForProposalStatus(status: ProposalStatus): "approval_required" | "coordination" | "architecture" {
  if (status === "approval_required") return "approval_required";
  if (status === "execution_planned") return "coordination";
  return "coordination";
}