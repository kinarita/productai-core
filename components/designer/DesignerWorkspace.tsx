"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { TechnicalSpecificationIntakePanel } from "@/components/designer/TechnicalSpecificationIntakePanel";
import { UserFlowPanel } from "@/components/designer/UserFlowPanel";
import { ScreenInventoryPanel } from "@/components/designer/ScreenInventoryPanel";
import { UxSpecificationPanel } from "@/components/designer/UxSpecificationPanel";
import { DesignSpecificationPanel } from "@/components/designer/DesignSpecificationPanel";
import { ComponentInventoryPanel } from "@/components/designer/ComponentInventoryPanel";
import { DesignReviewPanel } from "@/components/designer/DesignReviewPanel";
import { DesignerWorkspaceSummary } from "@/components/designer/DesignerWorkspaceSummary";
import { DevelopmentHandoffContextPanel } from "@/components/developer/DevelopmentHandoffContextPanel";
import { buildDevelopmentHandoffContextItems } from "@/lib/developer/developerAnalysis";
import { useDesignerWorkspace } from "@/lib/hooks/useDesignerWorkspace";
import { useDesignerWorkspaceStore } from "@/lib/store/designerWorkspaceStore";
import type { DesignerWorkspaceViewId } from "@/lib/designer/designerWorkspace";
import type { DesignReviewStateId } from "@/lib/designer/designerWorkspace";
import { cn } from "@/lib/utils";

const views: { id: DesignerWorkspaceViewId; label: string }[] = [
  { id: "intake", label: "Tech Spec Intake" },
  { id: "user_flow", label: "User Flow" },
  { id: "screens", label: "Screens" },
  { id: "ux", label: "UX Spec" },
  { id: "design_spec", label: "Design Spec" },
  { id: "components", label: "Components" },
  { id: "review", label: "Design Review" },
  { id: "summary", label: "Summary" },
  { id: "context", label: "Full Context" },
];

const reviewStates: DesignReviewStateId[] = [
  "not_ready",
  "preparing",
  "review_candidate",
  "ready_for_development_planning",
];

export function DesignerWorkspace({
  missions,
  tasks,
  initialMissionId,
  initialUserFlowId,
  initialDesignSpecificationId,
}: {
  missions: Mission[];
  tasks: Task[];
  initialMissionId?: string | null;
  initialUserFlowId?: string | null;
  initialDesignSpecificationId?: string | null;
}) {
  const selectedMissionId = useDesignerWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useDesignerWorkspaceStore((s) => s.setSelectedMission);
  const selectedUserFlowId = useDesignerWorkspaceStore((s) => s.selectedUserFlowId);
  const setSelectedUserFlow = useDesignerWorkspaceStore((s) => s.setSelectedUserFlow);
  const selectedDesignSpecificationId = useDesignerWorkspaceStore(
    (s) => s.selectedDesignSpecificationId
  );
  const setSelectedDesignSpecification = useDesignerWorkspaceStore(
    (s) => s.setSelectedDesignSpecification
  );
  const selectedReviewState = useDesignerWorkspaceStore((s) => s.selectedReviewState);
  const setSelectedReviewState = useDesignerWorkspaceStore((s) => s.setSelectedReviewState);
  const view = useDesignerWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useDesignerWorkspaceStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;
  const filterUserFlowId = selectedUserFlowId ?? initialUserFlowId ?? null;
  const filterDesignSpecId =
    selectedDesignSpecificationId ?? initialDesignSpecificationId ?? null;

  const { rows, context, overview, progressNote, eligibleCount } = useDesignerWorkspace({
    missions,
    tasks,
    missionId: filterMissionId,
    userFlowId: filterUserFlowId,
    designSpecificationId: filterDesignSpecId,
    reviewStateFilter: selectedReviewState,
  });

  const developmentHandoffItems = useMemo(
    () => buildDevelopmentHandoffContextItems(missions, tasks),
    [missions, tasks]
  );

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  useEffect(() => {
    if (initialUserFlowId) setSelectedUserFlow(initialUserFlowId);
  }, [initialUserFlowId, setSelectedUserFlow]);

  useEffect(() => {
    if (initialDesignSpecificationId) setSelectedDesignSpecification(initialDesignSpecificationId);
  }, [initialDesignSpecificationId, setSelectedDesignSpecification]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{overview.advisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Technical Specification → User Flow → Screen Inventory → UX Specification → Design
        Specification → Design Review
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
                setSelectedUserFlow(row.userFlowId);
                setSelectedDesignSpecification(row.designSpecificationId);
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
          No design context available. Complete{" "}
          <Link href="/architect-workspace" className="text-accent hover:underline">
            Architect Workspace
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
        <Card title="Design Summary" description={`${eligibleCount} mission(s) with design context`}>
          <DesignerWorkspaceSummary summary={overview} />
        </Card>
      )}

      {context && (view === "intake" || view === "context") && (
        <Card title="Technical Specification Intake" description="From Architect Workspace">
          <TechnicalSpecificationIntakePanel intake={context.intake} />
        </Card>
      )}

      {context && (view === "user_flow" || view === "context") && (
        <Card title="User Flow" description="Card format—no diagram generation">
          <UserFlowPanel flow={context.userFlow} />
        </Card>
      )}

      {context && (view === "screens" || view === "context") && (
        <Card title="Screen Inventory" description="Screen list for UX planning">
          <ScreenInventoryPanel rows={context.screens} />
        </Card>
      )}

      {context && (view === "ux" || view === "context") && (
        <Card title="UX Specification" description="UX goals and friction points">
          <UxSpecificationPanel ux={context.ux} />
        </Card>
      )}

      {context && (view === "design_spec" || view === "context") && (
        <Card title="Design Specification" description="UX/UI guidelines—display only">
          <DesignSpecificationPanel spec={context.designSpec} />
        </Card>
      )}

      {context && (view === "components" || view === "context") && (
        <Card title="Component Inventory" description="Reusable UI components for planning">
          <ComponentInventoryPanel rows={context.components} />
        </Card>
      )}

      {context && (view === "review" || view === "context") && (
        <Card title="Design Review" description="Readiness recommendation only">
          <DesignReviewPanel context={context.designReview} />
        </Card>
      )}

      {(view === "review" || view === "context") && (
        <Card title="Development Handoff Context" description="User flow, design spec, and Developer readiness">
          <DevelopmentHandoffContextPanel items={developmentHandoffItems} />
        </Card>
      )}

      <Card title="Workspace Links" description="Architecture to design continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/developer-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Developer Workspace
          </Link>
          <Link
            href="/architect-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Architect Workspace
          </Link>
          <Link
            href="/director-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Director Workspace
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
