"use client";

import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  cpfRecommendationLabel,
  painSeverityLabel,
} from "@/lib/cpf/cpfTypes";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";

export function CustomerProblemFitCard({ run }: { run?: PlannerAgentRun }) {
  const report = run?.cpfReport;

  if (!report) {
    return (
      <Card title="Customer Problem Fit">
        <p className="text-sm text-muted">
          Opportunity Discovery のあと、Planner が顧客像・課題・痛みの大きさを整理します。
        </p>
        <p className="mt-2 text-xs text-muted">
          CPF 分析が完了すると、ここにレポートが表示されます。
        </p>
      </Card>
    );
  }

  const topPain = report.painPoints.find((p) => p.priority === 1) ?? report.painPoints[0];

  return (
    <Card
      title="Customer Problem Fit"
      description="顧客課題の深掘り（Architect 前）"
    >
      <div className="space-y-5 text-sm">
        <section>
          <p className="text-xs font-medium uppercase text-muted">Persona</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {report.persona.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-xs font-medium uppercase text-muted">Top Pain</p>
          {topPain ? (
            <div className="mt-2 rounded-lg border border-border bg-surface px-3 py-2">
              <p className="font-medium text-foreground">{topPain.text}</p>
              <p className="mt-1 text-xs text-muted">
                Severity: {painSeverityLabel(topPain.severity)}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-muted">—</p>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-3 border-t border-border pt-4">
          <div>
            <p className="text-xs font-medium uppercase text-muted">Burning Need Score</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {report.burningNeedScore}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">CPF Score</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{report.cpfScore}%</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Recommendation</p>
            <p className="mt-1 font-medium text-foreground">
              {cpfRecommendationLabel(report.recommendation)}
            </p>
          </div>
        </section>

        <section>
          <p className="text-xs font-medium uppercase text-muted">All pain points</p>
          <ol className="mt-2 list-inside list-decimal space-y-2 text-foreground">
            {report.painPoints.map((p) => (
              <li key={p.priority}>
                {p.text}{" "}
                <Badge variant="muted" className="ml-1 align-middle">
                  {painSeverityLabel(p.severity)}
                </Badge>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Card>
  );
}
