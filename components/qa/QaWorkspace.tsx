"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission, PullRequest, ReleaseItem, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import type { QaWorkspaceViewId, QaReviewStateId } from "@/lib/qa/qaWorkspace";
import { useQaWorkspace } from "@/lib/hooks/useQaWorkspace";
import { useQaWorkspaceStore } from "@/lib/store/qaWorkspaceStore";
import { DevelopmentIntakePanel } from "@/components/qa/DevelopmentIntakePanel";
import { TestPlanPanel } from "@/components/qa/TestPlanPanel";
import { ValidationChecklistPanel } from "@/components/qa/ValidationChecklistPanel";
import { AcceptanceCriteriaPanel } from "@/components/qa/AcceptanceCriteriaPanel";
import { QualityRiskReviewPanel } from "@/components/qa/QualityRiskReviewPanel";
import { ReleaseValidationPanel } from "@/components/qa/ReleaseValidationPanel";
import { QaReadinessPanel } from "@/components/qa/QaReadinessPanel";
import { QaWorkspaceSummary } from "@/components/qa/QaWorkspaceSummary";

const views: { id: QaWorkspaceViewId; label: string }[] = [
  { id: "intake", label: "Development Intake" },
  { id: "test_plan", label: "Test Plan" },
  { id: "checklist", label: "Validation Checklist" },
  { id: "acceptance", label: "Acceptance Criteria" },
  { id: "risk_review", label: "Quality Risk Review" },
  { id: "release_validation", label: "Release Validation" },
  { id: "readiness", label: "QA Readiness" },
  { id: "summary", label: "Summary" },
  { id: "context", label: "Full Context" },
];

const reviewStates: QaReviewStateId[] = ["planned", "in_review", "completed"];

export function QaWorkspace({
  missions,
  tasks,
  pullRequests,
  releases,
  initialMissionId,
  initialTestPlanId,
}: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  initialMissionId?: string | null;
  initialTestPlanId?: string | null;
}) {
  const selectedMissionId = useQaWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useQaWorkspaceStore((s) => s.setSelectedMission);
  const selectedTestPlanId = useQaWorkspaceStore((s) => s.selectedTestPlanId);
  const setSelectedTestPlan = useQaWorkspaceStore((s) => s.setSelectedTestPlan);
  const selectedReviewState = useQaWorkspaceStore((s) => s.selectedReviewState);
  const setSelectedReviewState = useQaWorkspaceStore((s) => s.setSelectedReviewState);
  const view = useQaWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useQaWorkspaceStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;
  const filterTestPlanId = selectedTestPlanId ?? initialTestPlanId ?? null;

  const { rows, context, overview, progressNote, eligibleCount } = useQaWorkspace({
    missions,
    tasks,
    pullRequests,
    releases,
    missionId: filterMissionId,
    testPlanId: filterTestPlanId,
    reviewStateFilter: selectedReviewState,
  });

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  useEffect(() => {
    if (initialTestPlanId) setSelectedTestPlan(initialTestPlanId);
  }, [initialTestPlanId, setSelectedTestPlan]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{overview.advisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Development Intake → Test Plan → Validation Checklist → Acceptance Criteria → Risk Review →
        Release Validation → QA Readiness
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
                setSelectedTestPlan(row.testPlanId);
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
          No development context available yet. Complete{" "}
          <Link href="/developer-workspace" className="text-accent hover:underline">
            Developer Workspace
          </Link>{" "}
          planning first.
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
            onClick={() => setSelectedReviewState(selectedReviewState === state ? null : state)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs",
              selectedReviewState === state
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {state.replaceAll("_", " ")}
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
        <Card title="Quality Summary" description={`${eligibleCount} mission(s) with QA planning context`}>
          <QaWorkspaceSummary summary={overview} />
        </Card>
      )}

      {context && (view === "intake" || view === "context") && (
        <Card title="Development Intake" description="From Developer Workspace">
          <DevelopmentIntakePanel intake={context.intake} />
        </Card>
      )}

      {context && (view === "test_plan" || view === "context") && (
        <Card title="Test Plan" description="Planning only—no test execution">
          <TestPlanPanel plan={context.testPlan} />
        </Card>
      )}

      {context && (view === "checklist" || view === "context") && (
        <Card title="Validation Checklist" description="Planned · In Review · Completed (recommendation only)">
          <ValidationChecklistPanel checklist={context.checklist} />
        </Card>
      )}

      {context && (view === "acceptance" || view === "context") && (
        <Card title="Acceptance Criteria" description="Human-readable expectations">
          <AcceptanceCriteriaPanel rows={context.acceptance} />
        </Card>
      )}

      {context && (view === "risk_review" || view === "context") && (
        <Card title="Quality Risk Review" description="Recommendation only—no automatic judgment">
          <QualityRiskReviewPanel review={context.riskReview} />
        </Card>
      )}

      {context && (view === "release_validation" || view === "context") && (
        <Card title="Release Validation" description="Release readiness input for human review—no execution">
          <ReleaseValidationPanel view={context.releaseValidation} />
        </Card>
      )}

      {context && (view === "readiness" || view === "context") && (
        <Card title="QA Readiness" description="Ready For Release Review recommendation">
          <QaReadinessPanel context={context.readiness} />
        </Card>
      )}

      <Card title="Workspace Links" description="Implementation planning to quality planning continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/developer-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Developer Workspace
          </Link>
          <Link
            href="/release-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Release Readiness Workspace
          </Link>
          <Link
            href="/artifact-review"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Artifact Review Workspace
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

