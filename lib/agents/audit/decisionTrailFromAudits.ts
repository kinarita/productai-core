import { agentDisplayName } from "@/lib/agents/audit/agentAuditLabels";
import type { AgentAuditRecord } from "@/lib/agents/audit/agentAuditTypes";
import { buildMissionAgentAuditTimeline } from "@/lib/agents/audit/agentAuditSelectors";

export interface DecisionTrailAuditEntry {
  id: string;
  timestamp: string;
  agentLabel: string;
  status: string;
  summary: string;
  model: string;
  providerId: string;
  promptVersion: string;
}

export function buildDecisionTrailEntriesFromAudits(
  auditTrail: AgentAuditRecord[],
  missionId: string
): DecisionTrailAuditEntry[] {
  return buildMissionAgentAuditTimeline(auditTrail, missionId).map((audit) => ({
    id: audit.id,
    timestamp: audit.timestamp,
    agentLabel: agentDisplayName(audit.agentId),
    status: audit.status,
    summary:
      audit.status === "failed"
        ? (audit.errorMessage ?? "Agent run failed")
        : (audit.analysis?.slice(0, 120) ?? "Agent completed successfully"),
    model: audit.model,
    providerId: audit.providerId,
    promptVersion: audit.promptVersion,
  }));
}
