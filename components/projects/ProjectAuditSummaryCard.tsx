"use client";

import { Card } from "@/components/Card";
import { agentDisplayName } from "@/lib/agents/audit/agentAuditLabels";
import type { PlannerAuditRecord } from "@/lib/agents/planner/plannerTypes";

export function ProjectAuditSummaryCard({ audit }: { audit?: PlannerAuditRecord }) {
  if (!audit) {
    return (
      <Card title="Audit Summary">
        <p className="text-sm text-muted">No agent audit record yet for this project.</p>
      </Card>
    );
  }

  return (
    <Card title="Audit Summary">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Agent</dt>
          <dd className="text-foreground">{agentDisplayName(audit.agentId)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Status</dt>
          <dd className={audit.status === "failed" ? "text-danger" : "text-foreground"}>
            {audit.status}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Model</dt>
          <dd className="text-foreground">{audit.model}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Provider</dt>
          <dd className="text-foreground">{audit.providerId}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Prompt version</dt>
          <dd className="text-foreground">{audit.promptVersion}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Timestamp</dt>
          <dd className="text-foreground">{new Date(audit.timestamp).toLocaleString()}</dd>
        </div>
        {audit.promptHash ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-muted">Prompt hash (SHA-256)</dt>
            <dd className="break-all font-mono text-xs text-muted">{audit.promptHash}</dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
