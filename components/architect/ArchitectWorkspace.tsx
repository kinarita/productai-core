"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { MissionIntakePanel } from "@/components/architect/MissionIntakePanel";
import { TechnicalSpecificationPanel } from "@/components/architect/TechnicalSpecificationPanel";
import { SystemDesignPanel } from "@/components/architect/SystemDesignPanel";
import { ComponentDesignPanel } from "@/components/architect/ComponentDesignPanel";
import { DataModelPanel } from "@/components/architect/DataModelPanel";
import { ApiDesignPanel } from "@/components/architect/ApiDesignPanel";
import { DependencyDesignPanel } from "@/components/architect/DependencyDesignPanel";
import { ArchitectureReviewPanel } from "@/components/architect/ArchitectureReviewPanel";
import { ArchitectWorkspaceSummary } from "@/components/architect/ArchitectWorkspaceSummary";
import { useArchitectWorkspace } from "@/lib/hooks/useArchitectWorkspace";
import { useArchitectWorkspaceStore } from "@/lib/store/architectWorkspaceStore";
import type { ArchitectWorkspaceViewId } from "@/lib/architect/architectWorkspace";
import type { ArchitectureReviewStateId } from "@/lib/architect/architectWorkspace";
import { cn } from "@/lib/utils";

const views: { id: ArchitectWorkspaceViewId; label: string }[] = [
  { id: "intake", label: "Mission Intake" },
  { id: "specification", label: "Technical Spec" },
  { id: "system_design", label: "System Design" },
  { id: "components", label: "Components" },
  { id: "data_model", label: "Data Model" },
  { id: "api", label: "API Design" },
  { id: "dependencies", label: "Dependencies" },
  { id: "review", label: "Architecture Review" },
  { id: "summary", label: "Summary" },
  { id: "context", label: "Full Context" },
];

const reviewStates: ArchitectureReviewStateId[] = [
  "not_ready",
  "preparing",
  "review_candidate",
  "ready_for_design_review",
];

export function ArchitectWorkspace({
  missions,
  tasks,
  initialMissionId,
  initialSpecificationId,
}: {
  missions: Mission[];
  tasks: Task[];
  initialMissionId?: string | null;
  initialSpecificationId?: string | null;
}) {
  const selectedMissionId = useArchitectWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useArchitectWorkspaceStore((s) => s.setSelectedMission);
  const selectedSpecificationId = useArchitectWorkspaceStore((s) => s.selectedSpecificationId);
  const setSelectedSpecification = useArchitectWorkspaceStore((s) => s.setSelectedSpecification);
  const selectedReviewState = useArchitectWorkspaceStore((s) => s.selectedReviewState);
  const setSelectedReviewState = useArchitectWorkspaceStore((s) => s.setSelectedReviewState);
  const view = useArchitectWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useArchitectWorkspaceStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;
  const filterSpecId = selectedSpecificationId ?? initialSpecificationId ?? null;

  const { rows, context, overview, progressNote, eligibleCount } = useArchitectWorkspace({
    missions,
    tasks,
    missionId: filterMissionId,
    specificationId: filterSpecId,
    reviewStateFilter: selectedReviewState,
  });

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  useEffect(() => {
    if (initialSpecificationId) setSelectedSpecification(initialSpecificationId);
  }, [initialSpecificationId, setSelectedSpecification]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{overview.advisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Mission Plan → Technical Specification → System Design → Component Design → Data Model → API
        Design → Architecture Review
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
                setSelectedSpecification(row.specificationId);
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
          No missions ready for architecture. Complete{" "}
          <Link href="/director-workspace" className="text-accent hover:underline">
            Director Workspace
          </Link>{" "}
          handoff first.
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
        <Card title="Architecture Summary" description={`${eligibleCount} mission(s) with design context`}>
          <ArchitectWorkspaceSummary summary={overview} />
        </Card>
      )}

      {context && (view === "intake" || view === "context") && (
        <Card title="Mission Intake" description="From Director Workspace—visualization only">
          <MissionIntakePanel intake={context.intake} />
        </Card>
      )}

      {context && (view === "specification" || view === "context") && (
        <Card title="Technical Specification" description="Architect-owned design artifact">
          <TechnicalSpecificationPanel spec={context.specification} />
        </Card>
      )}

      {context && (view === "system_design" || view === "context") && (
        <Card title="System Design" description="High-level areas—no diagram generation">
          <SystemDesignPanel areas={context.systemDesign} />
        </Card>
      )}

      {context && (view === "components" || view === "context") && (
        <Card title="Component Design" description="Layer responsibilities">
          <ComponentDesignPanel rows={context.components} />
        </Card>
      )}

      {context && (view === "data_model" || view === "context") && (
        <Card title="Data Model" description="Entity list—no ER diagram">
          <DataModelPanel entities={context.dataModel} />
        </Card>
      )}

      {context && (view === "api" || view === "context") && (
        <Card title="API Design" description="Endpoint scope—no implementation">
          <ApiDesignPanel rows={context.apiDesign} />
        </Card>
      )}

      {context && (view === "dependencies" || view === "context") && (
        <Card title="Dependency Design" description="Visibility only">
          <DependencyDesignPanel design={context.dependencyDesign} />
        </Card>
      )}

      {context && (view === "review" || view === "context") && (
        <Card title="Architecture Review" description="Readiness recommendation only">
          <ArchitectureReviewPanel context={context.architectureReview} />
        </Card>
      )}

      <Card title="Workspace Links" description="Planning to design continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/director-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Director Workspace
          </Link>
          <Link
            href="/product-brief"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Product Brief Workspace
          </Link>
          <Link
            href="/artifact-review"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Artifact Review Workspace
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
