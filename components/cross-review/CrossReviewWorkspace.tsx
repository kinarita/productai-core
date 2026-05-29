"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import type { CrossReviewWorkspaceViewId } from "@/lib/cross-review/crossRoleReviewWorkspace";
import { crossRoleReviewAdvisoryNote } from "@/lib/cross-review/crossRoleReviewWorkspace";
import { useCrossReviewWorkspace } from "@/lib/hooks/useCrossReviewWorkspace";
import { useCrossReviewWorkspaceStore } from "@/lib/store/crossReviewWorkspaceStore";
import { CrossReviewOverviewPanel } from "@/components/cross-review/CrossReviewOverviewPanel";
import { CrossReviewBoardPanel } from "@/components/cross-review/CrossReviewBoardPanel";
import { RoleReviewMatrixPanel } from "@/components/cross-review/RoleReviewMatrixPanel";
import { CrossReviewInspectorPanel } from "@/components/cross-review/CrossReviewInspectorPanel";
import { ReviewDependenciesPanel } from "@/components/cross-review/ReviewDependenciesPanel";
import { CrossReviewTraceabilityPanel } from "@/components/cross-review/CrossReviewTraceabilityPanel";
import { ReviewConcentrationPanel } from "@/components/cross-review/ReviewConcentrationPanel";
import { crossRoleReviewArtifactTypes } from "@/lib/cross-review/crossRoleReviewRecord";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import { reviewStateLevels } from "@/lib/review/reviewStatus";
import { matrixRoles } from "@/lib/cross-review/crossRoleReviewAnalysis";
import type { CrossReviewBoardRow } from "@/lib/cross-review/crossRoleReviewAnalysis";
import type { ReviewTargetTypeId } from "@/lib/review/artifactReview";
import { reviewTargetDefinitions } from "@/lib/review/artifactReview";

const views: { id: CrossReviewWorkspaceViewId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "board", label: "Review Board" },
  { id: "matrix", label: "Role Matrix" },
  { id: "inspector", label: "Inspector" },
  { id: "dependencies", label: "Dependencies" },
  { id: "traceability", label: "Traceability" },
  { id: "concentration", label: "Concentration" },
  { id: "context", label: "Full Context" },
];

export function CrossReviewWorkspace({
  missions,
  tasks,
  feedItems,
  initialMissionId,
  initialArtifactId,
  initialReviewId,
}: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  initialMissionId?: string | null;
  initialArtifactId?: string | null;
  initialReviewId?: string | null;
}) {
  const selectedMissionId = useCrossReviewWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useCrossReviewWorkspaceStore((s) => s.setSelectedMission);
  const selectedArtifactId = useCrossReviewWorkspaceStore((s) => s.selectedArtifactId);
  const setSelectedArtifact = useCrossReviewWorkspaceStore((s) => s.setSelectedArtifact);
  const selectedReviewId = useCrossReviewWorkspaceStore((s) => s.selectedReviewId);
  const setSelectedReview = useCrossReviewWorkspaceStore((s) => s.setSelectedReview);
  const selectedRole = useCrossReviewWorkspaceStore((s) => s.selectedRole);
  const setSelectedRole = useCrossReviewWorkspaceStore((s) => s.setSelectedRole);
  const view = useCrossReviewWorkspaceStore((s) => s.selectedView);
  const setSelectedView = useCrossReviewWorkspaceStore((s) => s.setSelectedView);
  const [stateFilter, setStateFilter] = useState<ReviewStateId | null>(null);
  const [artifactTypeFilter, setArtifactTypeFilter] = useState<ReviewTargetTypeId | null>(null);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;
  const filterArtifactId = selectedArtifactId ?? initialArtifactId ?? null;
  const filterReviewId = selectedReviewId ?? initialReviewId ?? null;

  const {
    board,
    overview,
    matrix,
    concentration,
    inspector,
    traceability,
    dependency,
    selected,
    progressNote,
  } = useCrossReviewWorkspace({
    missions,
    tasks,
    feedItems,
    missionId: filterMissionId,
    artifactId: filterArtifactId,
    reviewId: filterReviewId,
    roleFilter: selectedRole,
  });

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  useEffect(() => {
    if (initialArtifactId) setSelectedArtifact(initialArtifactId);
  }, [initialArtifactId, setSelectedArtifact]);

  useEffect(() => {
    if (initialReviewId) setSelectedReview(initialReviewId);
  }, [initialReviewId, setSelectedReview]);

  const handleSelectRow = (row: CrossReviewBoardRow) => {
    setSelectedReview(row.reviewId);
    setSelectedArtifact(row.artifactId);
    setSelectedMission(row.missionId);
    setSelectedView("inspector");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{crossRoleReviewAdvisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Product Brief · Mission Plan · Architecture · Design · Development · QA — cross-role
        review visibility only
      </div>

      {progressNote ? <p className="text-xs text-muted">{progressNote}</p> : null}

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted">Mission:</span>
        <button
          type="button"
          onClick={() => setSelectedMission(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !filterMissionId && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {missions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMission(m.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              filterMissionId === m.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted">Role:</span>
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !selectedRole && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {matrixRoles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRole(selectedRole === r.id ? null : r.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              selectedRole === r.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted">State:</span>
        <button
          type="button"
          onClick={() => setStateFilter(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !stateFilter && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {reviewStateLevels.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStateFilter(stateFilter === s.id ? null : s.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              stateFilter === s.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted">Artifact type:</span>
        <button
          type="button"
          onClick={() => setArtifactTypeFilter(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !artifactTypeFilter && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {reviewTargetDefinitions
          .filter((t) => crossRoleReviewArtifactTypes.includes(t.id))
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setArtifactTypeFilter(artifactTypeFilter === t.id ? null : t.id)
              }
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs transition",
                artifactTypeFilter === t.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "text-muted hover:border-accent/40"
              )}
            >
              {t.title}
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

      {(view === "overview" || view === "context") && (
        <Card title="Review Overview" description="Organization-wide cross-role review counts">
          <CrossReviewOverviewPanel overview={overview} />
        </Card>
      )}

      {(view === "board" || view === "context") && (
        <Card title="Review Board" description="Click a row to inspect—no automatic approval">
          <CrossReviewBoardPanel
            rows={board}
            selectedReviewId={selected?.reviewId ?? filterReviewId}
            onSelect={handleSelectRow}
          />
        </Card>
      )}

      {(view === "matrix" || view === "context") && (
        <Card title="Role Review Matrix" description="Review load by role—no prioritization">
          <RoleReviewMatrixPanel matrix={matrix} />
        </Card>
      )}

      {inspector && (view === "inspector" || view === "context") && (
        <Card title="Review Inspector" description={inspector.artifactTitle}>
          <CrossReviewInspectorPanel inspector={inspector} />
        </Card>
      )}

      {dependency && (view === "dependencies" || view === "context") && (
        <Card title="Review Dependencies" description="Aligned with artifact lineage chain">
          <ReviewDependenciesPanel
            parent={dependency.parent}
            child={dependency.child}
            missionId={selected?.missionId}
          />
        </Card>
      )}

      {traceability && (view === "traceability" || view === "context") && (
        <Card title="Review Traceability" description="Accountability and human review context">
          <CrossReviewTraceabilityPanel view={traceability} />
        </Card>
      )}

      {(view === "concentration" || view === "context") && (
        <Card title="Review Concentration" description="Descriptive notes only">
          <ReviewConcentrationPanel view={concentration} />
        </Card>
      )}

      <Card title="Workspace Links" description="Lineage and per-artifact review continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/artifact-lineage" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Lineage
          </Link>
          <Link href="/artifact-review" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Review
          </Link>
          <Link href="/team-handoff" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Team Handoff
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
