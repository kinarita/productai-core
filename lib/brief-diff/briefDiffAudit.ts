import { createAuditId } from "@/lib/agents/audit/agentAuditTypes";
import type { AgentAuditRecord } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerGenerationResult } from "@/lib/agents/planner/plannerTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type { BriefVersionAuditRecord } from "@/lib/brief-diff/briefDiffTypes";

export type BriefDiffAuditEventType =
  | "brief_version_created"
  | "brief_diff_generated"
  | "change_applied_with_review";

export function buildBriefDiffAuditRecord(input: {
  missionId: string;
  eventType: BriefDiffAuditEventType;
  audit: BriefVersionAuditRecord;
  runInput?: ProjectCreationInput;
}): AgentAuditRecord<ProjectCreationInput, PlannerGenerationResult> {
  const a = input.audit;
  return {
    id: createAuditId(),
    missionId: input.missionId,
    agentId: "product_planner",
    timestamp: a.timestamp,
    providerId: `brief-diff-${input.eventType}`,
    model: "productai-brief-diff-v1",
    promptVersion: `brief-diff-${input.eventType}-v1`,
    input: input.runInput ?? { idea: "", targetUsers: "", successGoal: "", discoveryMode: "quick" },
    analysis: `Brief v${a.versionId} from v${a.previousVersionId}: ${a.changeSummary.proposalTitle ?? "change applied"}`,
    decisions: [
      `versionId: ${a.versionId}`,
      `previousVersionId: ${a.previousVersionId}`,
      `sourceDiscussionId: ${a.sourceDiscussionId ?? "none"}`,
      `appliedBy: ${a.appliedBy}`,
    ],
    reasoning: [
      `WHY: ${a.reason}`,
      `WHY: Impact — ${a.impact}`,
      `WHY: Added — ${a.changeSummary.added.join(", ") || "none"}`,
      `WHY: Modified — ${a.changeSummary.modified.join(", ") || "none"}`,
    ],
    status: "success",
  };
}
