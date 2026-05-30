"use client";

import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  evidenceLevelLabel,
  recommendedActionLabel,
} from "@/lib/opportunity/opportunityTypes";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";

export function OpportunityBriefCard({ run }: { run?: PlannerAgentRun }) {
  const brief = run?.opportunityBrief;

  if (!brief) {
    return (
      <Card title="Opportunity Brief">
        <p className="text-sm text-muted">
          Planner は Product Brief の前に市場機会・顧客課題・既存代替を整理します。
        </p>
        <p className="mt-2 text-xs text-muted">
          企画チェックが進むと、ここに Opportunity Brief が表示されます。
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Opportunity Brief"
      description="Architect に渡す前の機会整理（仮説ベース）"
    >
      <div className="space-y-5 text-sm">
        <section>
          <p className="text-xs font-medium uppercase text-muted">Opportunity</p>
          <p className="mt-1 text-foreground">{brief.opportunitySummary}</p>
        </section>

        <section>
          <p className="text-xs font-medium uppercase text-muted">Pain</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {brief.customerPain.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-xs font-medium uppercase text-muted">Alternatives</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {brief.currentAlternatives.map((a) => (
              <li key={a}>
                <Badge variant="muted">{a}</Badge>
              </li>
            ))}
          </ul>
          <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
            {brief.whyExistingSolutionsFail.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs font-medium uppercase text-muted">Evidence</p>
            <p className="mt-1 font-medium text-foreground">
              {evidenceLevelLabel(brief.evidenceLevel)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Recommendation</p>
            <p className="mt-1 font-medium text-foreground">
              {recommendedActionLabel(brief.recommendedAction)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Planner confidence</p>
            <p className="mt-1 font-medium text-foreground">{brief.plannerConfidence}%</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase text-muted">Hypothesis</p>
          <p className="mt-1 text-muted">{brief.opportunityHypothesis}</p>
        </section>
      </div>
    </Card>
  );
}
