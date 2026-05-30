"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { opportunityAuditFromBrief, recommendedActionLabel, evidenceLevelLabel } from "@/lib/opportunity/opportunityTypes";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";

export function ShouldWeBuildCard({
  missionId,
  run,
}: {
  missionId: string;
  run?: PlannerAgentRun;
}) {
  const brief = run?.opportunityBrief;
  const audit = run?.audit;
  const readiness = run?.pmfReadiness;

  const opportunityScore =
    brief?.plannerConfidence ??
    audit?.opportunityScore ??
    readiness?.opportunityDiscovery;
  const painConfidence =
    audit?.customerPainConfidence ?? readiness?.cpf;
  const evidenceLevel = brief?.evidenceLevel ?? audit?.evidenceLevel;
  const recommendation = brief?.recommendedAction ?? audit?.recommendedAction;

  if (opportunityScore === undefined && !brief) {
    return (
      <Card title="Should We Build This?">
        <p className="text-sm text-muted">
          プロジェクトを開くと、Planner が作る価値と機会を整理します。
        </p>
      </Card>
    );
  }

  const fields = brief ? opportunityAuditFromBrief(brief) : null;

  return (
    <Card title="Should We Build This?">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Opportunity Score</dt>
          <dd className="text-lg font-semibold text-foreground">
            {opportunityScore ?? fields?.opportunityScore ?? "—"}%
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Customer Pain Confidence</dt>
          <dd className="text-lg font-semibold text-foreground">
            {painConfidence ?? fields?.customerPainConfidence ?? "—"}%
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Evidence Level</dt>
          <dd className="text-foreground">
            {evidenceLevel ? evidenceLevelLabel(evidenceLevel) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">Proceed Recommendation</dt>
          <dd className="text-foreground">
            {recommendation ? recommendedActionLabel(recommendation) : "—"}
          </dd>
        </div>
      </dl>
      <Link
        href={`/projects/${missionId}`}
        className="mt-4 inline-block text-xs text-accent hover:underline"
      >
        Opportunity Brief を見る →
      </Link>
    </Card>
  );
}
