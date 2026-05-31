"use client";

import { Card } from "@/components/Card";
import {
  psfConfidenceLabel,
  psfRecommendationLabel,
} from "@/lib/psf/psfTypes";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";

function MvpColumn({ title, items }: { title: string; items: string[] }) {
  const uniqueItems = items.filter((item, index) => items.indexOf(item) === index);

  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{title}</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground">
        {uniqueItems.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ProblemSolutionFitCard({ run }: { run?: PlannerAgentRun }) {
  const report = run?.psfReport;

  if (!report) {
    return (
      <Card title="Problem Solution Fit">
        <p className="text-sm text-muted">
          CPF のあと、Planner が解決仮説・MVP 候補・検証方法を整理します。
        </p>
        <p className="mt-2 text-xs text-muted">
          PSF 分析が完了すると、ここにレポートが表示されます。
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title="Problem Solution Fit"
        description="解決策が課題に合うか（Architect 前）"
      >
        <div className="space-y-5 text-sm">
          <section>
            <p className="text-xs font-medium uppercase text-muted">Top Problem</p>
            <p className="mt-1 text-foreground">{report.topProblem}</p>
          </section>

          <section>
            <p className="text-xs font-medium uppercase text-muted">Solution Hypothesis</p>
            <p className="mt-1 text-foreground">{report.solutionHypothesis}</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-3 border-t border-border pt-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted">PSF Score</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{report.psfScore}%</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted">Confidence</p>
              <p className="mt-1 font-medium text-foreground">
                {psfConfidenceLabel(report.confidenceLevel)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted">Recommendation</p>
              <p className="mt-1 font-medium text-foreground">
                {psfRecommendationLabel(report.recommendation)}
              </p>
            </div>
          </section>

          <section>
            <p className="text-xs font-medium uppercase text-muted">Expected Outcome</p>
            <p className="mt-1 text-muted">{report.expectedOutcome}</p>
          </section>
        </div>
      </Card>

      <Card title="MVP Scope">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MvpColumn title="Must Have" items={report.mvpFeatures.mustHave} />
          <MvpColumn title="Should Have" items={report.mvpFeatures.shouldHave} />
          <MvpColumn title="Could Have" items={report.mvpFeatures.couldHave} />
          <MvpColumn title="Won't Have" items={report.mvpFeatures.wontHave} />
        </div>
      </Card>
    </div>
  );
}
