"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { buildDecisionTrailEntriesFromAudits } from "@/lib/agents/audit/decisionTrailFromAudits";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";

/** Agent-agnostic audit timeline (Phase 15 — infrastructure; no Architect runs yet). */
export function AgentAuditTrailPanel({ missionId }: { missionId: string | null }) {
  const auditTrail = useAgentRunsStore((s) => s.auditTrail);

  const entries = useMemo(
    () => (missionId ? buildDecisionTrailEntriesFromAudits(auditTrail, missionId) : []),
    [auditTrail, missionId]
  );

  if (!missionId) {
    return (
      <Card title="Agent audit trail">
        <p className="text-sm text-muted">Select a mission to view agent audit history.</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card title="Agent audit trail">
        <p className="text-sm text-muted">No agent audits recorded for this mission yet.</p>
      </Card>
    );
  }

  return (
    <Card title="Agent audit trail">
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-lg border border-border px-3 py-2 text-sm">
            <p className="font-medium text-foreground">
              {entry.agentLabel} · {entry.status}
            </p>
            <p className="mt-1 text-xs text-muted">
              {new Date(entry.timestamp).toLocaleString()} · {entry.model} · {entry.providerId} ·{" "}
              {entry.promptVersion}
            </p>
            <p className="mt-1 text-muted">{entry.summary}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
