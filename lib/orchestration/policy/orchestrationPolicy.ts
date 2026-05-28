import type { OrchestrationContext } from "@/lib/orchestration/orchestrationTypes";
import type { AIProposal, ProposalType } from "@/lib/orchestration/policy/policyTypes";

export const PROPOSAL_LIFECYCLE_ORDER = [
  "proposal",
  "approval_required",
  "approved",
  "revision_requested",
  "rejected",
  "execution_planned",
] as const;

export function initialProposalStatus(requiresCEO: boolean): AIProposal["status"] {
  return requiresCEO ? "approval_required" : "proposal";
}

export function governanceNoteForProposalType(type: ProposalType): string {
  switch (type) {
    case "architecture_change":
      return "Execution planning may proceed after CEO approval.";
    case "release_decision":
      return "Release sequencing should follow approved executive judgment.";
    case "dependency_escalation":
      return "Dependency resolution should be coordinated before execution expansion.";
    case "runtime_recovery":
      return "Recovery actions require executive review before automated remediation.";
    case "execution_plan":
      return "This plan is advisory only; no tasks are created automatically.";
    default:
      return "Informational output only; no autonomous execution is triggered.";
  }
}

export function createExecutiveSyncProposals(
  context: OrchestrationContext,
  missionId: string
): Omit<AIProposal, "id" | "status" | "createdAt">[] {
  const mission = context.missions.find((m) => m.id === missionId);
  const blocked = context.tasks.filter((t) => t.missionId === missionId && t.status === "blocked").length;

  const proposals: Omit<AIProposal, "id" | "status" | "createdAt">[] = [];

  proposals.push({
    sourceAgent: "COO",
    proposalType: "dependency_escalation",
    summary: blocked > 0
      ? `Stabilize dependency chain for ${mission?.name ?? "mission"}`
      : `Maintain execution cadence for ${mission?.name ?? "mission"}`,
    rationale: blocked > 0
      ? "Blocked dependencies are limiting throughput and increasing coordination overhead."
      : "Execution velocity is stable; focus should remain quality and sequencing discipline.",
    risk: {
      level: blocked > 0 ? "high" : "medium",
      factors: blocked > 0 ? ["Blocked task dependencies"] : ["Stable execution flow"],
    },
    requiresCEOApproval: blocked > 0,
    missionId,
    governanceNote: governanceNoteForProposalType("dependency_escalation"),
  });

  if ((mission?.blockers.length ?? 0) > 0 || context.syncWarnings.length > 0) {
    proposals.push({
      sourceAgent: "Architect",
      proposalType: "architecture_change",
      summary: "Finalize API schema stabilization before rollout expansion",
      rationale: "Schema drift increases rework risk across dependent tasks.",
      risk: { level: "medium", factors: ["Schema stability", "Cross-team dependencies"] },
      requiresCEOApproval: true,
      missionId,
      governanceNote: governanceNoteForProposalType("architecture_change"),
    });
  }

  return proposals;
}