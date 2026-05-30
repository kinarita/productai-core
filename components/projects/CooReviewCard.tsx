"use client";

import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import {
  cooRecommendationBadgeVariant,
  cooRecommendationLabel,
  type CooReviewReport,
} from "@/lib/coo-review/cooReviewTypes";
import { getCooReviewReport } from "@/lib/coo-review/architectGate";
import { formatReadinessPercent } from "@/lib/pmf/pmfStatus";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { Mission } from "@/types/productai";

export function CooReviewCard({
  mission,
  run,
}: {
  mission: Mission;
  run?: PlannerAgentRun;
}) {
  const report = getCooReviewReport(mission, run);

  if (!report) {
    const briefReady = Boolean(run?.brief ?? mission.requirementsSummary?.trim());
    return (
      <Card title="COO Review">
        <p className="text-sm text-muted">
          {briefReady
            ? "Product Brief is ready — COO Review will run automatically after planning completes."
            : "COO Review runs after Opportunity, CPF, PSF, and Product Brief are complete."}
        </p>
      </Card>
    );
  }

  return (
    <Card title="COO Review">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge variant={cooRecommendationBadgeVariant(report.recommendation)}>
          Recommendation: {cooRecommendationLabel(report.recommendation)}
        </Badge>
        <div>
          <p className="text-[11px] font-medium uppercase text-muted">Overall Score</p>
          <p className="text-lg font-semibold text-foreground">
            {formatReadinessPercent(report.overallScore).replace("%", "")}
            <span className="text-sm font-normal text-muted"> / 100</span>
          </p>
        </div>
      </div>

      <p className="mb-4 rounded-lg border border-indigo-200/60 bg-indigo-50/40 px-3 py-2 text-xs text-muted">
        This is an AI COO recommendation. Final approval belongs to the CEO.
      </p>

      <section className="space-y-4 text-sm">
        <div>
          <h3 className="text-xs font-medium uppercase text-muted">Executive Summary</h3>
          <p className="mt-1 text-foreground">{report.executiveSummary}</p>
        </div>

        <ScoreGrid scores={report.scores} />

        <AssessmentBlock title="Market Opportunity" body={report.marketOpportunityAssessment} />
        <AssessmentBlock title="Customer Problem" body={report.customerProblemAssessment} />
        <AssessmentBlock title="Solution Fit" body={report.solutionAssessment} />
        <AssessmentBlock title="Risk" body={report.riskAssessment} />

        <BulletSection title="Strengths" items={report.strengths} />
        <BulletSection title="Concerns" items={report.concerns} variant="concern" />
        <BulletSection title="Suggested Actions" items={report.requiredActions} />
      </section>

      <p className="mt-4 text-[11px] text-muted">
        Reviewed {new Date(report.reviewedAt).toLocaleString()} · Awaiting CEO decision
      </p>
    </Card>
  );
}

function ScoreGrid({ scores }: { scores: CooReviewReport["scores"] }) {
  const rows: Array<{ label: string; value: number; invert?: boolean }> = [
    { label: "Market Opportunity", value: scores.marketOpportunity },
    { label: "Problem Severity", value: scores.problemSeverity },
    { label: "Solution Confidence", value: scores.solutionConfidence },
    { label: "MVP Feasibility", value: scores.mvpFeasibility },
    { label: "Risk Level", value: scores.riskLevel, invert: true },
    { label: "Strategic Fit", value: scores.strategicFit },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg border border-border bg-surface px-3 py-2">
          <p className="text-[10px] font-medium uppercase text-muted">{row.label}</p>
          <p className="text-sm font-semibold text-foreground">
            {formatReadinessPercent(row.value).replace("%", "")}
            {row.invert ? (
              <span className="ml-1 text-[10px] font-normal text-muted">(higher = riskier)</span>
            ) : null}
          </p>
        </div>
      ))}
    </div>
  );
}

function AssessmentBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase text-muted">{title}</h3>
      <p className="mt-1 text-muted">{body}</p>
    </div>
  );
}

function BulletSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: "concern";
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-medium uppercase text-muted">{title}</h3>
      <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted">
        {items.map((item) => (
          <li key={item} className={variant === "concern" ? "text-foreground/90" : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
