"use client";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/Card";
import { briefPreviewFromRun } from "@/lib/agents/planner/plannerWorkerOverlay";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { CreatedProjectMeta } from "@/lib/project-creation/projectCreationTypes";
import { usePlannerRunForMission } from "@/lib/agents/planner/usePlannerRunForMission";
import { usePlannerAgentStore } from "@/lib/store/plannerAgentStore";
import { cn } from "@/lib/utils";

export function ProjectPlannerSections({
  missionId,
  meta,
  missionBrief,
}: {
  missionId: string;
  meta?: CreatedProjectMeta;
  missionBrief: string;
}) {
  const run = usePlannerRunForMission(missionId);
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

      {run &&
      (run.strengths?.length ||
        run.gaps?.length ||
        run.nextActions?.length ||
        run.opportunities?.length ||
        run.threats?.length ||
        run.painPoints?.length ||
        run.burningNeeds?.length ||
        run.validationAssumptions?.length ||
        run.validationRisks?.length ||
        run.mvpScope?.length) ? (
        <Card title="Discovery insights" className="lg:col-span-2">
          <PlannerGapBody run={run} />
        </Card>
      ) : null}

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
  if (run.status === "failed") {
    return (
      <p className="text-sm text-danger">
        {run.errorMessage ?? "Unable to generate Product Brief"}
      </p>
    );
  }

  const processing = run.status === "assessing" || run.status === "working";
  const processingMessage =
    run.status === "working"
      ? run.psfReport
        ? "Planner is generating Product Brief…"
        : run.cpfReport
          ? "Planner is running problem-solution fit analysis…"
          : run.opportunityBrief
            ? "Planner is running customer problem fit analysis…"
            : "Planner is running opportunity discovery…"
      : "Planner is assessing information completeness…";
  const showClarificationHint = run.status === "awaiting_clarification";
  const showAnalysis = run.status === "completed" && (run.analysis || run.reasoning.length > 0);

  return (
    <div className="relative min-h-[4rem]">
      {showClarificationHint ? (
        <p className="text-sm text-muted">
          Answer the clarification questions above. Planner will explain WHY each question matters
          before generating your Product Brief.
        </p>
      ) : showAnalysis ? (
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
      ) : (
        <p className="text-sm text-muted">Planner reasoning will appear here.</p>
      )}
      {processing ? (
        <div
          className={cn(
            "absolute inset-0 flex items-center gap-2 rounded-lg bg-background/80 px-2 text-sm text-muted",
            showAnalysis || showClarificationHint ? "bg-background/90" : ""
          )}
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden />
          {processingMessage}
        </div>
      ) : null}
    </div>
  );
}

function PlannerGapBody({ run }: { run: PlannerAgentRun }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
      {run.strengths && run.strengths.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Strengths</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {run.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.gaps && run.gaps.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Gaps</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
            {run.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.nextActions && run.nextActions.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Next actions</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {run.nextActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.opportunities && run.opportunities.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Opportunities</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {run.opportunities.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.threats && run.threats.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Threats</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
            {run.threats.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.painPoints && run.painPoints.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Pain points</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {run.painPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.burningNeeds && run.burningNeeds.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Burning needs</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {run.burningNeeds.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.validationAssumptions && run.validationAssumptions.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Validation assumptions</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {run.validationAssumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.validationRisks && run.validationRisks.length > 0 ? (
        <section>
          <p className="text-xs font-medium uppercase text-muted">Validation risks</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted">
            {run.validationRisks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {run.mvpScope && run.mvpScope.length > 0 ? (
        <section className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-medium uppercase text-muted">MVP scope</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
            {run.mvpScope.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      ) : null}
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
  const processing = run?.status === "assessing" || run?.status === "working";
  const hasBrief = run?.status === "completed" || briefText.includes("## Project Summary");
  const failed = run?.status === "failed";

  if (failed) {
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

  return (
    <div className="relative min-h-[5rem]">
      {hasBrief ? (
        <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {briefText}
        </pre>
      ) : (
        <p className="text-sm text-muted">
          Waiting for Product Planner — your brief will appear here when generation completes.
        </p>
      )}
      {processing ? (
        <div className="absolute inset-0 flex items-center gap-2 rounded-lg border border-accent/20 bg-indigo-50/90 px-4 py-3 text-sm text-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden />
          Planner is creating Product Brief…
        </div>
      ) : null}
    </div>
  );
}
