"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { AiWorkerMissionStatus } from "@/lib/agent-first/workerAnalysis";
import { briefPreviewFromRun } from "@/lib/agents/planner/plannerWorkerOverlay";
import { isArchitectUnlocked } from "@/lib/coo-review/architectGate";
import { usePlannerAgentStore } from "@/lib/store/plannerAgentStore";
import { useMissionStore } from "@/lib/store/missionStore";
import { cn } from "@/lib/utils";

const statusStyles: Record<AiWorkerMissionStatus["status"], string> = {
  completed: "bg-success/15 text-success",
  in_progress: "bg-accent/15 text-accent",
  waiting: "bg-warning/15 text-warning",
  not_started: "bg-border text-muted",
};

export function AiWorkerDetailPanel({
  entry,
  selected,
  onSelect,
  missionId,
}: {
  entry: AiWorkerMissionStatus;
  selected: boolean;
  onSelect: () => void;
  missionId?: string;
}) {
  const { worker, status, statusLabel, explainability, plannerRunStatus } = entry;
  const plannerRun = usePlannerAgentStore((s) => (missionId ? s.getRun(missionId) : undefined));
  const mission = useMissionStore((s) =>
    missionId ? s.missions.find((m) => m.id === missionId) : undefined
  );
  const retryGeneration = usePlannerAgentStore((s) => s.retryGeneration);
  const isPlanner = worker.id === "product_planner";
  const isArchitect = worker.id === "architect";
  const architectUnlocked = isArchitectUnlocked(mission, plannerRun);
  const isFailed = isPlanner && plannerRunStatus === "failed";
  const isWorking = isPlanner && plannerRunStatus === "working";

  return (
    <div className="rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
          selected ? "bg-surface" : "hover:bg-surface/60"
        )}
      >
        <span className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>
            {worker.emoji}
          </span>
          <span>
            <span className="block text-sm font-medium text-foreground">{worker.title}</span>
            <span className="text-xs text-muted">
              {worker.outputLabel}
            </span>
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            isFailed ? "bg-danger/15 text-danger" : statusStyles[status]
          )}
        >
          {isWorking ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              {statusLabel}
            </span>
          ) : (
            statusLabel
          )}
        </span>
      </button>

      {selected ? (
        <div className="space-y-4 border-t border-border px-4 py-4">
          <section>
            <p className="text-xs font-medium uppercase text-muted">実施内容</p>
            <p className="mt-1 text-sm text-foreground">{explainability.workSummary}</p>
          </section>
          <section>
            <p className="text-xs font-medium uppercase text-muted">入力</p>
            <p className="mt-1 text-sm text-muted">{explainability.inputSummary}</p>
          </section>
          <section>
            <p className="text-xs font-medium uppercase text-muted">出力</p>
            <p className="mt-1 text-sm text-foreground">{explainability.outputSummary}</p>
          </section>
          {isWorking ? (
            <p className="text-sm text-muted">Planner is creating Product Brief…</p>
          ) : null}
          {isFailed && missionId ? (
            <div className="space-y-2">
              <p className="text-sm text-danger">
                {plannerRun?.errorMessage ?? "Unable to generate Product Brief"}
              </p>
              <button
                type="button"
                onClick={() => void retryGeneration(missionId)}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
              >
                Retry
              </button>
            </div>
          ) : null}
          <section>
            <p className="text-xs font-medium uppercase text-muted">Why（判断理由）</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
              {explainability.whyReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
          {isPlanner && plannerRun?.status === "completed" && mission ? (
            <section>
              <p className="text-xs font-medium uppercase text-muted">Product Brief preview</p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-2 text-xs text-muted">
                {(() => {
                  const text = briefPreviewFromRun(plannerRun, mission.requirementsSummary);
                  return text.length > 900 ? `${text.slice(0, 900)}…` : text;
                })()}
              </pre>
            </section>
          ) : null}
          {isArchitect && !architectUnlocked ? (
            <p className="text-sm text-muted">
              Architect Workspace is locked until the CEO approves architecture.
            </p>
          ) : null}
          {!(isArchitect && !architectUnlocked) ? (
            <Link
              href={entry.workspaceHref}
              className="inline-block text-xs text-accent hover:underline"
            >
              詳細ワークスペースを開く（上級者向け）
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
