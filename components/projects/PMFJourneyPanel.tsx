"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import {
  PMF_STAGE_ORDER,
  pmfStageHumanLabels,
  pmfStageToReadinessKey,
  readinessScoreForStage,
  type PmfStage,
} from "@/lib/pmf/pmfJourney";
import {
  PMF_VALIDATION_MILESTONES,
  formatReadinessPercent,
  pmfMeasurementStatusLabels,
  pmfNotYetMeasurableCopy,
  pmfPlannerExplanation,
  pmfValidationMilestoneState,
  type PmfMeasurementStatus,
} from "@/lib/pmf/pmfStatus";
import { discoveryModeDisplayTitle } from "@/lib/project-creation/discoveryModeLabels";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import { cn } from "@/lib/utils";

const pmfStageAdvancedLabels: Record<PmfStage, string> = {
  idea_validation: "Idea",
  opportunity_discovery: "Opportunity Discovery",
  cpf: "CPF",
  psf: "PSF",
  mvp: "MVP",
  pmf: "PMF Status",
};

export function PMFJourneyPanel({ run }: { run?: PlannerAgentRun }) {
  const [showDetails, setShowDetails] = useState(false);
  const readiness = run?.pmfReadiness;
  const current = run?.currentPmfStage ?? "idea_validation";
  const pmfMeasurementStatus: PmfMeasurementStatus =
    run?.pmfMeasurementStatus ?? "not_measured";
  const pmfReadinessScore = run?.pmfReadinessScore;
  const milestones = pmfValidationMilestoneState(run);

  if (!readiness) {
    return (
      <Card title="作る価値チェック">
        <p className="text-sm text-muted">
          このプロジェクトはまだAIによる企画チェックが始まっていません。
        </p>
        <p className="mt-2 text-xs text-muted">
          ホームの「AIチームに依頼する」から開始してください。
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="作る価値チェック"
      description={
        run?.discoveryMode
          ? `はじめ方：${discoveryModeDisplayTitle(run.discoveryMode)}`
          : undefined
      }
    >
      <p className="mb-4 text-sm text-foreground">
        いまの焦点: <strong>{pmfStageHumanLabels[current].title}</strong>
      </p>
      <ul className="space-y-3">
        {PMF_STAGE_ORDER.map((stage) =>
          stage === "pmf" ? (
            <PmfNotMeasurableRow
              key={stage}
              isCurrent={stage === current}
              measurementStatus={pmfMeasurementStatus}
            />
          ) : (
            <PmfStageRow
              key={stage}
              stage={stage}
              score={readinessScoreForStage(readiness, stage)}
              isCurrent={stage === current}
            />
          )
        )}
      </ul>

      <div className="mt-4 grid gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase text-muted">PMF Readiness</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {pmfReadinessScore !== undefined
              ? formatReadinessPercent(pmfReadinessScore)
              : "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            公開前の検証進捗（実 PMF ではありません）
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase text-muted">PMF Status</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {pmfMeasurementStatusLabels[pmfMeasurementStatus].title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {pmfMeasurementStatusLabels[pmfMeasurementStatus].summary}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase text-muted">PMF Journey</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {PMF_VALIDATION_MILESTONES.map((milestone) => {
            const done = milestones[milestone.id];
            return (
              <li
                key={milestone.id}
                className={cn(
                  "flex items-center gap-2",
                  done ? "text-foreground" : "text-muted"
                )}
              >
                <span aria-hidden className="w-4 shrink-0 text-center">
                  {done ? "✓" : "□"}
                </span>
                <span>{milestone.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {run?.gaps && run.gaps.length > 0 ? (
        <p className="mt-4 text-xs text-muted">いちばんのギャップ: {run.gaps[0]}</p>
      ) : null}

      <div className="mt-4 rounded-lg border border-border bg-indigo-50/30 p-3 text-xs text-muted">
        <p className="text-foreground">{pmfPlannerExplanation.lead}</p>
        <p className="mt-2">{pmfPlannerExplanation.pmfNote}</p>
        <p className="mt-2 font-medium text-foreground">{pmfPlannerExplanation.focusTitle}</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          {pmfPlannerExplanation.focusItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="mt-4 text-xs text-accent hover:underline"
      >
        {showDetails ? "詳細スコアを隠す" : "詳細スコアを表示"}
      </button>
      {showDetails ? (
        <ul className="mt-2 space-y-1 rounded-lg border border-border bg-surface p-3 text-[11px] text-muted">
          {PMF_STAGE_ORDER.filter((stage) => stage !== "pmf").map((stage) => (
            <li key={stage} className="flex justify-between gap-2">
              <span>{pmfStageAdvancedLabels[stage]}</span>
              <span className="font-medium text-foreground">
                {formatReadinessPercent(readiness[pmfStageToReadinessKey[stage]])}
              </span>
            </li>
          ))}
          <li className="flex justify-between gap-2 border-t border-border pt-2">
            <span>{pmfStageAdvancedLabels.pmf}</span>
            <span className="font-medium text-foreground">
              {pmfMeasurementStatusLabels[pmfMeasurementStatus].title}
            </span>
          </li>
        </ul>
      ) : null}
    </Card>
  );
}

function PmfStageRow({
  stage,
  score,
  isCurrent,
}: {
  stage: PmfStage;
  score: number;
  isCurrent: boolean;
}) {
  const label = pmfStageHumanLabels[stage];
  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2",
        isCurrent ? "border-accent/40 bg-indigo-50/40" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{label.title}</span>
        <span className="text-muted">{formatReadinessPercent(score)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full", isCurrent ? "bg-accent" : "bg-success/70")}
          style={{ width: `${Math.min(100, Math.max(0, Math.round(score)))}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted">{label.summary(score)}</p>
    </li>
  );
}

function PmfNotMeasurableRow({
  isCurrent,
  measurementStatus,
}: {
  isCurrent: boolean;
  measurementStatus: PmfMeasurementStatus;
}) {
  const label = pmfStageHumanLabels.pmf;
  const measurable = measurementStatus !== "not_measured";

  if (measurable) {
    return (
      <li
        className={cn(
          "rounded-lg border px-3 py-2",
          isCurrent ? "border-accent/40 bg-indigo-50/40" : "border-border"
        )}
      >
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-foreground">{label.title}</span>
          <span className="text-muted">{pmfMeasurementStatusLabels[measurementStatus].title}</span>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {pmfMeasurementStatusLabels[measurementStatus].summary}
        </p>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2",
        isCurrent ? "border-accent/40 bg-indigo-50/40" : "border-border"
      )}
    >
      <div className="text-xs font-medium text-foreground">{label.title}</div>
      <dl className="mt-2 space-y-1 text-[11px]">
        <div>
          <dt className="font-medium text-muted">Status</dt>
          <dd className="text-foreground">{pmfNotYetMeasurableCopy.status}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted">Description</dt>
          <dd className="text-muted">{pmfNotYetMeasurableCopy.description}</dd>
        </div>
      </dl>
    </li>
  );
}
