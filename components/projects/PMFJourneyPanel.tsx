"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import {
  PMF_STAGE_ORDER,
  pmfStageHumanLabels,
  pmfStageToReadinessKey,
  readinessScoreForStage,
  type PmfReadiness,
  type PmfStage,
} from "@/lib/pmf/pmfJourney";
import { discoveryModeDisplayTitle } from "@/lib/project-creation/discoveryModeLabels";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import { cn } from "@/lib/utils";

const pmfStageAdvancedLabels: Record<PmfStage, string> = {
  idea_validation: "Idea",
  opportunity_discovery: "Opportunity Discovery",
  cpf: "CPF",
  psf: "PSF",
  mvp: "MVP",
  pmf: "PMF",
};

export function PMFJourneyPanel({ run }: { run?: PlannerAgentRun }) {
  const [showDetails, setShowDetails] = useState(false);
  const readiness = run?.pmfReadiness;
  const current = run?.currentPmfStage ?? "idea_validation";

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
        {PMF_STAGE_ORDER.map((stage) => (
          <PmfStageRow
            key={stage}
            stage={stage}
            score={readinessScoreForStage(readiness, stage)}
            isCurrent={stage === current}
          />
        ))}
      </ul>
      {run?.gaps && run.gaps.length > 0 ? (
        <p className="mt-4 text-xs text-muted">いちばんのギャップ: {run.gaps[0]}</p>
      ) : null}
      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="mt-4 text-xs text-accent hover:underline"
      >
        {showDetails ? "詳細スコアを隠す" : "詳細スコアを表示"}
      </button>
      {showDetails ? (
        <ul className="mt-2 space-y-1 rounded-lg border border-border bg-surface p-3 text-[11px] text-muted">
          {PMF_STAGE_ORDER.map((stage) => (
            <li key={stage} className="flex justify-between gap-2">
              <span>{pmfStageAdvancedLabels[stage]}</span>
              <span className="font-medium text-foreground">
                {readiness[pmfStageToReadinessKey[stage]]}%
              </span>
            </li>
          ))}
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
        <span className="text-muted">{score}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full", isCurrent ? "bg-accent" : "bg-success/70")}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted">{label.summary(score)}</p>
    </li>
  );
}
