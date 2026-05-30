"use client";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/Card";
import { briefPreviewFromRun } from "@/lib/agents/planner/plannerWorkerOverlay";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { CreatedProjectMeta } from "@/lib/project-creation/projectCreationTypes";
import { usePlannerAgentStore } from "@/lib/store/plannerAgentStore";

export function ProjectPlannerSections({
  missionId,
  meta,
  missionBrief,
}: {
  missionId: string;
  meta?: CreatedProjectMeta;
  missionBrief: string;
}) {
  const run = usePlannerAgentStore((s) => s.getRun(missionId));
  const retryGeneration = usePlannerAgentStore((s) => s.retryGeneration);

  const input = run?.input ?? meta;
  const briefText = briefPreviewFromRun(run, missionBrief);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Input">
        {input ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-foreground">Project idea</dt>
              <dd className="mt-1 whitespace-pre-wrap text-muted">{input.idea}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Target users</dt>
              <dd className="mt-1 text-muted">{input.targetUsers}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Success goal</dt>
              <dd className="mt-1 text-muted">{input.successGoal}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted">No creation input recorded for this project.</p>
        )}
      </Card>

      <Card title="Planner Reasoning">
        <PlannerReasoningBody run={run} />
      </Card>

      <div className="lg:col-span-2">
      <Card title="Generated Product Brief">
        <PlannerBriefBody
          run={run}
          briefText={briefText}
          onRetry={() => void retryGeneration(missionId)}
        />
      </Card>
      </div>
    </div>
  );
}

function PlannerReasoningBody({ run }: { run?: PlannerAgentRun }) {
  if (!run || run.status === "idle") {
    return <p className="text-sm text-muted">Planner will record analysis and WHY once work begins.</p>;
  }
  if (run.status === "working") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
        Planner is analyzing input and forming decisions…
      </div>
    );
  }
  if (run.status === "failed") {
    return (
      <p className="text-sm text-danger">
        {run.errorMessage ?? "Unable to generate Product Brief"}
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {run.analysis ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Analysis</p>
          <p className="mt-1 text-foreground">{run.analysis}</p>
        </section>
      ) : null}
      {run.decisions && run.decisions.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Decisions</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
            {run.decisions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <p className="text-xs font-medium uppercase text-muted">WHY</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
          {(run.reasoning.length > 0 ? run.reasoning : ["No reasoning lines returned."]).map(
            (line) => (
              <li key={line}>{line}</li>
            )
          )}
        </ul>
      </section>
    </div>
  );
}

function PlannerBriefBody({
  run,
  briefText,
  onRetry,
}: {
  run?: PlannerAgentRun;
  briefText: string;
  onRetry: () => void;
}) {
  if (run?.status === "working") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-indigo-50/40 px-4 py-3 text-sm text-foreground">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden />
        Planner is creating Product Brief…
      </div>
    );
  }

  if (run?.status === "failed") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-danger">
          {run.errorMessage ?? "Unable to generate Product Brief"}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (run?.status === "completed" || briefText.includes("## Project Summary")) {
    return (
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 text-xs text-muted">
        {briefText.slice(0, 2400)}
        {briefText.length > 2400 ? "…" : ""}
      </pre>
    );
  }

  return (
    <p className="text-sm text-muted">
      Waiting for Product Planner — your brief will appear here when generation completes.
    </p>
  );
}
