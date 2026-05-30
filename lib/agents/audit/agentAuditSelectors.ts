import type { AgentAuditRecord, AgentId, AgentRun } from "@/lib/agents/audit/agentAuditTypes";
import { agentRunKey } from "@/lib/agents/audit/agentAuditTypes";

export function getMissionAuditTrail(
  auditTrail: AgentAuditRecord[],
  missionId: string
): AgentAuditRecord[] {
  return auditTrail.filter((a) => a.missionId === missionId);
}

export function getAgentAuditTrail(
  auditTrail: AgentAuditRecord[],
  missionId: string,
  agentId: AgentId
): AgentAuditRecord[] {
  return auditTrail.filter((a) => a.missionId === missionId && a.agentId === agentId);
}

export function getLatestAgentRun(
  runs: Record<string, AgentRun>,
  missionId: string,
  agentId: AgentId
): AgentRun | undefined {
  return runs[agentRunKey(missionId, agentId)];
}

/** Chronological agent audits for Decision Trail (multi-agent ready). */
export function sortAuditTrailChronological(
  entries: AgentAuditRecord[]
): AgentAuditRecord[] {
  return [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function buildMissionAgentAuditTimeline(
  auditTrail: AgentAuditRecord[],
  missionId: string
): AgentAuditRecord[] {
  return sortAuditTrailChronological(getMissionAuditTrail(auditTrail, missionId));
}
