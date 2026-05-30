"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { pmfStageHumanLabels, topGapSummary, topNextAction } from "@/lib/pmf/pmfJourney";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";

export function PmfJourneyDashboardCard({
  missionId,
  run,
}: {
  missionId: string;
  missionName: string;
  run?: PlannerAgentRun;
}) {
  const readiness = run?.pmfReadiness;
  const stage = run?.currentPmfStage ?? "idea_validation";

  if (!readiness) {
    return (
      <Card title="作る価値チェック">
        <p className="text-sm text-muted">
          このプロジェクトはまだAIによる企画チェックが始まっていません。
        </p>
        <p className="mt-2 text-xs text-muted">
          「AIチームに依頼する」から開始してください。
        </p>
      </Card>
    );
  }

  return (
    <Card title="作る価値チェック">
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase text-muted">いまの焦点</dt>
          <dd className="text-foreground">{pmfStageHumanLabels[stage].title}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">確信度</dt>
          <dd className="text-foreground">{readiness.ideaValidation}%（アイデア）</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">いちばんのギャップ</dt>
          <dd className="text-muted">{topGapSummary(run?.gaps ?? [])}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">次におすすめ</dt>
          <dd className="text-muted">{topNextAction(run?.nextActions ?? [])}</dd>
        </div>
      </dl>
      <Link
        href={`/projects/${missionId}`}
        className="mt-3 inline-block text-xs text-accent hover:underline"
      >
        プロジェクトで詳細を見る →
      </Link>
    </Card>
  );
}
