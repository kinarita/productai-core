"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";
import { ProjectActivityFeed } from "@/components/projects/ProjectActivityFeed";
import { ProjectHubPlannerEffect } from "@/components/projects/ProjectHubPlannerEffect";
import { ProjectAuditSummaryCard } from "@/components/projects/ProjectAuditSummaryCard";
import { CustomerProblemFitCard } from "@/components/projects/CustomerProblemFitCard";
import { CooReviewCard } from "@/components/projects/CooReviewCard";
import { DiscoveryDiscussionCard } from "@/components/projects/DiscoveryDiscussionCard";
import { CeoDecisionCard } from "@/components/projects/CeoDecisionCard";
import { ProblemSolutionFitCard } from "@/components/projects/ProblemSolutionFitCard";
import { OpportunityBriefCard } from "@/components/projects/OpportunityBriefCard";
import { PMFJourneyPanel } from "@/components/projects/PMFJourneyPanel";
import { ProjectPlannerQuestionsPanel } from "@/components/projects/ProjectPlannerQuestionsPanel";
import { ProjectPlannerSections } from "@/components/projects/ProjectPlannerSections";
import { mergePlannerIntoWorkerStatuses } from "@/lib/agents/planner/plannerWorkerOverlay";
import { buildAiWorkerStatusesForMission } from "@/lib/agent-first/workerAnalysis";
import { buildProjectTimeline } from "@/lib/project-creation/projectTimeline";
import { usePlannerRunForMission } from "@/lib/agents/planner/usePlannerRunForMission";
import { isArchitectUnlocked, architectLockReason } from "@/lib/coo-review/architectGate";
import { useMissionStore } from "@/lib/store/missionStore";
import { useProjectCreationStore } from "@/lib/store/projectCreationStore";
import type { PlannerRunStatus } from "@/lib/agents/planner/plannerTypes";
import { cn } from "@/lib/utils";
import { releases } from "@/data/mockData";
import { ArrowRight, Loader2 } from "lucide-react";

function plannerHubStatusMessage(
  status: PlannerRunStatus | undefined,
  options: { briefReady: boolean; errorMessage?: string }
): string {
  switch (status) {
    case "assessing":
      return "Planner is assessing requirements…";
    case "awaiting_clarification":
      return "Planner needs clarification — answer questions below.";
    case "working":
      return "Planner is creating Product Brief…";
    case "failed":
      return options.errorMessage ?? "Unable to generate Product Brief";
    case "completed":
      return options.briefReady
        ? "Product Brief ready — review COO recommendation and approve as CEO."
        : "Planning in progress.";
    default:
      return options.briefReady
        ? "Product Brief ready — review COO recommendation and approve as CEO."
        : "Planning in progress.";
  }
}

export function ProjectHubView({ missionId }: { missionId: string }) {
  const mission = useMissionStore((s) => s.missions.find((m) => m.id === missionId));
  const meta = useProjectCreationStore((s) => s.getMetaForMission(missionId));
  const activities = useProjectCreationStore(
    useShallow((s) => s.getActivitiesForMission(missionId))
  );
  const plannerRun = usePlannerRunForMission(missionId);
  const workers = useMemo(
    () =>
      mission
        ? mergePlannerIntoWorkerStatuses(
            buildAiWorkerStatusesForMission(mission),
            plannerRun,
            mission
          )
        : [],
    [mission, plannerRun]
  );
  const architectUnlocked = isArchitectUnlocked(mission, plannerRun);

  if (!mission) {
    return (
      <AppShell title="Project not found">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to Projects
        </Link>
      </AppShell>
    );
  }

  const timeline = buildProjectTimeline({
    mission,
    releases,
    plannerStatus: plannerRun?.status,
    pmfStage: plannerRun?.currentPmfStage ?? mission.currentPmfStage,
  });
  const planner = workers.find((w) => w.worker.id === "product_planner");
  const plannerStatus = plannerRun?.status;
  const plannerStatusMessage = plannerHubStatusMessage(plannerStatus, {
    briefReady: Boolean(meta?.productBriefGenerated),
    errorMessage: plannerRun?.errorMessage,
  });
  const showPlannerSpinner = plannerStatus === "working";

  return (
    <AppShell title={mission.name} description={mission.summary}>
      <div className="space-y-8">
        <ProjectHubPlannerEffect missionId={missionId} />
        <Card title="Planning Timeline">
          <ProjectTimeline stages={timeline} />
        </Card>

        <PMFJourneyPanel run={plannerRun} />

        <OpportunityBriefCard run={plannerRun} />

        <CustomerProblemFitCard run={plannerRun} />

        <ProblemSolutionFitCard run={plannerRun} />

        <ProjectPlannerQuestionsPanel missionId={missionId} run={plannerRun} />

        <ProjectPlannerSections
          missionId={missionId}
          meta={meta}
          missionBrief={mission.requirementsSummary}
        />

        <CooReviewCard mission={mission} run={plannerRun} />

        <DiscoveryDiscussionCard mission={mission} run={plannerRun} missionId={missionId} />

        <CeoDecisionCard mission={mission} run={plannerRun} missionId={missionId} />

        <ProjectAuditSummaryCard audit={plannerRun?.audit} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="AI Team">
            <div className="space-y-3">
              {planner ? (
                <div className="rounded-lg border border-accent/20 bg-indigo-50/40 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {planner.worker.emoji} {planner.worker.title} — {planner.statusLabel}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span
                      className="inline-flex h-3 w-3 shrink-0 items-center justify-center"
                      aria-hidden
                    >
                      <Loader2
                        className={cn(
                          "h-3 w-3 text-accent",
                          showPlannerSpinner ? "animate-spin opacity-100" : "opacity-0"
                        )}
                      />
                    </span>
                    <span>{plannerStatusMessage}</span>
                  </p>
                </div>
              ) : null}
              <ul className="space-y-2 text-sm text-muted">
                {workers.map((w) => (
                  <li key={w.worker.id} className="flex justify-between gap-2">
                    <span>
                      {w.worker.emoji} {w.worker.title}
                      {w.worker.id === "architect" && !architectUnlocked ? (
                        <span className="ml-1 text-[10px] text-warning">(locked)</span>
                      ) : null}
                    </span>
                    <span className="text-foreground">{w.statusLabel}</span>
                  </li>
                ))}
              </ul>
              {!architectUnlocked ? (
                <p className="mt-3 text-xs text-muted">{architectLockReason(mission, plannerRun)}</p>
              ) : null}
              {architectUnlocked ? (
                <Link
                  href={`/architect-workspace?mission=${missionId}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  Open Architect Workspace
                </Link>
              ) : (
                <p className="mt-3 text-xs font-medium text-muted">
                  Architect Workspace — unavailable until CEO approves architecture
                </p>
              )}
            </div>
            <Link
              href={`/ai-team?mission=${missionId}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              View AI Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card title="Quick links">
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/ai-team?mission=${missionId}`} className="text-accent hover:underline">
                  AI Team — Planner status & WHY
                </Link>
              </li>
              <li>
                <Link
                  href={`/product-brief?mission=${missionId}`}
                  className="text-accent hover:underline"
                >
                  Full brief workspace (advanced)
                </Link>
              </li>
            </ul>
          </Card>
        </div>

        <Card title="Activity">
          <ProjectActivityFeed items={activities} />
        </Card>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/review-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-surface"
          >
            Reviews
          </Link>
          <Link
            href="/releases"
            className="rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-surface"
          >
            Releases
          </Link>
          <Link href="/" className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-surface">
            All projects
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
