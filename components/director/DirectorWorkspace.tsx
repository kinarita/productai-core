"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { ProductBriefIntakePanel } from "@/components/director/ProductBriefIntakePanel";
import { MissionPlanPanel } from "@/components/director/MissionPlanPanel";
import { DeliveryPlanPanel } from "@/components/director/DeliveryPlanPanel";
import { TaskBreakdownPanel } from "@/components/director/TaskBreakdownPanel";
import { ReviewSchedulePanel } from "@/components/director/ReviewSchedulePanel";
import { DependencyMapPanel } from "@/components/director/DependencyMapPanel";
import { ArchitectHandoffPanel } from "@/components/director/ArchitectHandoffPanel";
import { ArchitectHandoffCandidatesPanel } from "@/components/director/ArchitectHandoffCandidatesPanel";
import { DirectorWorkspaceSummary } from "@/components/director/DirectorWorkspaceSummary";
import { useDirectorWorkspace } from "@/lib/hooks/useDirectorWorkspace";
import { useDirectorWorkspaceStore } from "@/lib/store/directorWorkspaceStore";
import type { DirectorWorkspaceViewId } from "@/lib/director/directorWorkspace";
import type { DirectorReviewScheduleState } from "@/lib/director/directorWorkspace";
import { cn } from "@/lib/utils";

const views: { id: DirectorWorkspaceViewId; label: string }[] = [
  { id: "intake", label: "Brief Intake" },
  { id: "mission_plan", label: "Mission Plan" },
  { id: "delivery", label: "Delivery Plan" },
  { id: "tasks", label: "Task Breakdown" },
  { id: "schedule", label: "Review Schedule" },
  { id: "dependencies", label: "Dependencies" },
  { id: "architect", label: "Architect Handoff" },
  { id: "summary", label: "Summary" },
  { id: "context", label: "Full Context" },
];

const reviewStates: DirectorReviewScheduleState[] = ["planned", "scheduled", "completed"];

export function DirectorWorkspace({
  missions,
  tasks,
  initialBriefId,
  initialMissionId,
}: {
  missions: Mission[];
  tasks: Task[];
  initialBriefId?: string | null;
  initialMissionId?: string | null;
}) {
  const selectedBriefId = useDirectorWorkspaceStore((s) => s.selectedBriefId);
  const setSelectedBrief = useDirectorWorkspaceStore((s) => s.setSelectedBrief);
  const selectedMissionId = useDirectorWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useDirectorWorkspaceStore((s) => s.setSelectedMission);
  const selectedReviewState = useDirectorWorkspaceStore((s) => s.selectedReviewState);
  const setSelectedReviewState = useDirectorWorkspaceStore((s) => s.setSelectedReviewState);
  const view = useDirectorWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useDirectorWorkspaceStore((s) => s.setSelectedView);

  const filterBriefId = selectedBriefId ?? initialBriefId ?? null;
  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const {
    missionsList,
    context,
    overview,
    architectCandidates,
    progressNote,
    eligibleBriefs,
  } = useDirectorWorkspace({
    missions,
    tasks,
    briefId: filterBriefId,
    missionId: filterMissionId,
    reviewStateFilter: selectedReviewState,
  });

  useEffect(() => {
    if (initialBriefId) setSelectedBrief(initialBriefId);
  }, [initialBriefId, setSelectedBrief]);

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{overview.advisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Approved Product Brief → Mission Plan → Delivery Plan → Task Breakdown → Review Schedule →
        Architect Handoff
      </div>

      {progressNote ? <p className="text-xs text-muted">{progressNote}</p> : null}

      {missionsList.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted">Mission:</span>
          {missionsList.map((m) => (
            <button
              key={m.missionId}
              type="button"
              onClick={() => {
                setSelectedMission(m.missionId);
                setSelectedBrief(m.briefId);
              }}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs transition",
                filterMissionId === m.missionId || filterBriefId === m.briefId
                  ? "border-accent bg-accent/10 text-accent"
                  : "text-muted hover:border-accent/40"
              )}
            >
              {m.missionName}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">
          No approved Product Briefs available. Complete CEO approval in{" "}
          <Link href="/product-brief" className="text-accent hover:underline">
            Product Brief Workspace
          </Link>
          .
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Review state:</span>
        <button
          type="button"
          onClick={() => setSelectedReviewState(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !selectedReviewState && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {reviewStates.map((state) => (
          <button
            key={state}
            type="button"
            onClick={() =>
              setSelectedReviewState(selectedReviewState === state ? null : state)
            }
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs capitalize",
              selectedReviewState === state
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {state}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedView(v.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              view === v.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {(view === "summary" || view === "context") && (
        <Card title="Director Planning Summary" description="Organization-wide mission planning">
          <DirectorWorkspaceSummary summary={overview} />
        </Card>
      )}

      {context && (view === "intake" || view === "context") && (
        <Card title="Product Brief Intake" description="Director receives approved planning only">
          <ProductBriefIntakePanel intake={context.intake} />
        </Card>
      )}

      {context && (view === "mission_plan" || view === "context") && (
        <Card title="Mission Plan" description="Display only—no auto mission creation">
          <MissionPlanPanel plan={context.missionPlan} />
        </Card>
      )}

      {context && (view === "delivery" || view === "context") && (
        <Card title="Delivery Plan" description="Phases, milestones, and release goal">
          <DeliveryPlanPanel plan={context.deliveryPlan} />
        </Card>
      )}

      {context && (view === "tasks" || view === "context") && (
        <Card title="Task Breakdown" description="Existing tasks organized—no auto generation">
          <TaskBreakdownPanel rows={context.taskBreakdown} />
        </Card>
      )}

      {context && (view === "schedule" || view === "context") && (
        <Card title="Review Schedule" description="Planning cadence—human-led reviews">
          <ReviewSchedulePanel items={context.reviewSchedule} />
        </Card>
      )}

      {context && (view === "dependencies" || view === "context") && (
        <Card title="Dependency Map" description="Related context cards">
          <DependencyMapPanel cards={context.dependencyMap} />
        </Card>
      )}

      {context && (view === "architect" || view === "context") && (
        <Card title="Architect Handoff Readiness" description="Recommendation only">
          <ArchitectHandoffPanel context={context.architectHandoff} />
        </Card>
      )}

      {architectCandidates.length > 0 && (view === "architect" || view === "context") && (
        <Card title="Architect Handoff Candidates" description="Visualization only—no Architect Workspace yet">
          <ArchitectHandoffCandidatesPanel candidates={architectCandidates} />
        </Card>
      )}

      {eligibleBriefs.length > 0 && (view === "context" || view === "intake") && (
        <Card title="Approved Briefs Queue" description={`${eligibleBriefs.length} brief(s) eligible`}>
          <ul className="space-y-1 text-xs">
            {eligibleBriefs.map((b) => (
              <li key={b.briefId}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrief(b.briefId);
                    if (b.missionId) setSelectedMission(b.missionId);
                  }}
                  className="text-accent hover:underline"
                >
                  {b.title}
                </button>
                <span className="text-muted"> — {b.statusLabel}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Workspace Links" description="Planning continuity from idea to brief">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/product-brief"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Product Brief Workspace
          </Link>
          <Link
            href="/idea-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            CEO Idea Workspace
          </Link>
          <Link
            href="/team-handoff"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            AI Team Handoff
          </Link>
          <Link
            href="/ceo-home"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
