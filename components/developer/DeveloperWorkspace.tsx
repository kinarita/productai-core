"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { DesignIntakePanel } from "@/components/developer/DesignIntakePanel";
import { ImplementationPlanPanel } from "@/components/developer/ImplementationPlanPanel";
import { WorkBreakdownPanel } from "@/components/developer/WorkBreakdownPanel";
import { RepositoryPlanPanel } from "@/components/developer/RepositoryPlanPanel";
import { TechnicalRiskReviewPanel } from "@/components/developer/TechnicalRiskReviewPanel";
import { ReviewPreparationPanel } from "@/components/developer/ReviewPreparationPanel";
import { DevelopmentReadinessPanel } from "@/components/developer/DevelopmentReadinessPanel";
import { DeveloperWorkspaceSummary } from "@/components/developer/DeveloperWorkspaceSummary";
import { QaHandoffContextPanel } from "@/components/qa/QaHandoffContextPanel";
import { pullRequests, releases } from "@/data/mockData";
import { useDeveloperWorkspace } from "@/lib/hooks/useDeveloperWorkspace";
import { buildQaHandoffContextItems } from "@/lib/qa/qaAnalysis";
import { useDeveloperWorkspaceStore } from "@/lib/store/developerWorkspaceStore";
import type { DeveloperWorkspaceViewId } from "@/lib/developer/developerWorkspace";
import type { DevelopmentReadinessStateId } from "@/lib/developer/developerWorkspace";
import { cn } from "@/lib/utils";

const views: { id: DeveloperWorkspaceViewId; label: string }[] = [
  { id: "intake", label: "Design Intake" },
  { id: "implementation_plan", label: "Implementation Plan" },
  { id: "work_breakdown", label: "Work Breakdown" },
  { id: "repository", label: "Repository Plan" },
  { id: "risks", label: "Technical Risks" },
  { id: "review_prep", label: "Review Prep" },
  { id: "readiness", label: "Readiness" },
  { id: "summary", label: "Summary" },
  { id: "context", label: "Full Context" },
];

const reviewStates: DevelopmentReadinessStateId[] = [
  "not_ready",
  "preparing",
  "review_candidate",
  "ready_for_qa_planning",
];

export function DeveloperWorkspace({
  missions,
  tasks,
  initialMissionId,
  initialImplementationPlanId,
}: {
  missions: Mission[];
  tasks: Task[];
  initialMissionId?: string | null;
  initialImplementationPlanId?: string | null;
}) {
  const selectedMissionId = useDeveloperWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useDeveloperWorkspaceStore((s) => s.setSelectedMission);
  const selectedImplementationPlanId = useDeveloperWorkspaceStore(
    (s) => s.selectedImplementationPlanId
  );
  const setSelectedImplementationPlan = useDeveloperWorkspaceStore(
    (s) => s.setSelectedImplementationPlan
  );
  const selectedReviewState = useDeveloperWorkspaceStore((s) => s.selectedReviewState);
  const setSelectedReviewState = useDeveloperWorkspaceStore((s) => s.setSelectedReviewState);
  const view = useDeveloperWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useDeveloperWorkspaceStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;
  const filterPlanId = selectedImplementationPlanId ?? initialImplementationPlanId ?? null;

  const { rows, context, overview, progressNote, eligibleCount } = useDeveloperWorkspace({
    missions,
    tasks,
    missionId: filterMissionId,
    implementationPlanId: filterPlanId,
    reviewStateFilter: selectedReviewState,
  });

  const qaHandoffItems = useMemo(
    () =>
      buildQaHandoffContextItems({
        missions,
        tasks,
        pullRequests,
        releases,
      }),
    [missions, tasks]
  );

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  useEffect(() => {
    if (initialImplementationPlanId) setSelectedImplementationPlan(initialImplementationPlanId);
  }, [initialImplementationPlanId, setSelectedImplementationPlan]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{overview.advisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Design Intake → Implementation Plan → Work Breakdown → Repository Plan → Technical Risks →
        Review Preparation → Development Readiness
      </div>

      {progressNote ? <p className="text-xs text-muted">{progressNote}</p> : null}

      {rows.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted">Mission:</span>
          {rows.map((row) => (
            <button
              key={row.missionId}
              type="button"
              onClick={() => {
                setSelectedMission(row.missionId);
                setSelectedImplementationPlan(row.implementationPlanId);
              }}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs transition",
                filterMissionId === row.missionId
                  ? "border-accent bg-accent/10 text-accent"
                  : "text-muted hover:border-accent/40"
              )}
            >
              {row.missionName}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">
          No development context. Complete{" "}
          <Link href="/designer-workspace" className="text-accent hover:underline">
            Designer Workspace
          </Link>{" "}
          first.
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
              "rounded-full border border-border px-3 py-1 text-xs",
              selectedReviewState === state
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {state.replace(/_/g, " ")}
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
        <Card title="Development Summary" description={`${eligibleCount} mission(s) with planning context`}>
          <DeveloperWorkspaceSummary summary={overview} />
        </Card>
      )}

      {context && (view === "intake" || view === "context") && (
        <Card title="Design Intake" description="From Designer Workspace">
          <DesignIntakePanel intake={context.intake} />
        </Card>
      )}

      {context && (view === "implementation_plan" || view === "context") && (
        <Card title="Implementation Plan" description="Planning only—no code generation">
          <ImplementationPlanPanel plan={context.implementationPlan} />
        </Card>
      )}

      {context && (view === "work_breakdown" || view === "context") && (
        <Card title="Development Work Breakdown" description="Existing tasks organized">
          <WorkBreakdownPanel items={context.workBreakdown} />
        </Card>
      )}

      {context && (view === "repository" || view === "context") && (
        <Card title="Repository Plan" description="Design only—no execution">
          <RepositoryPlanPanel plan={context.repositoryPlan} />
        </Card>
      )}

      {context && (view === "risks" || view === "context") && (
        <Card title="Technical Risk Review" description="Recommendation only">
          <TechnicalRiskReviewPanel risks={context.technicalRisks} />
        </Card>
      )}

      {context && (view === "review_prep" || view === "context") && (
        <Card title="Development Review Preparation" description="Architecture, Design, Implementation context">
          <ReviewPreparationPanel prep={context.reviewPreparation} />
        </Card>
      )}

      {context && (view === "readiness" || view === "context") && (
        <Card title="Development Readiness" description="Ready For QA Planning recommendation">
          <DevelopmentReadinessPanel context={context.readiness} />
        </Card>
      )}

      {(view === "readiness" || view === "context") && (
        <Card title="QA Handoff Context" description="Implementation plan, technical risks, and QA readiness">
          <QaHandoffContextPanel items={qaHandoffItems} compact />
        </Card>
      )}

      <Card title="Workspace Links" description="Design to implementation planning continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/designer-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Designer Workspace
          </Link>
          <Link
            href="/architect-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Architect Workspace
          </Link>
          <Link
            href="/artifact-review"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Artifact Review Workspace
          </Link>
          <Link
            href="/qa-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            QA Workspace
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
