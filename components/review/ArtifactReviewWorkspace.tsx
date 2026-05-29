"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { ArtifactReviewBoard } from "@/components/review/ArtifactReviewBoard";
import { ArtifactReviewTimeline } from "@/components/review/ArtifactReviewTimeline";
import { ArtifactReviewSummary } from "@/components/review/ArtifactReviewSummary";
import { ReviewCommentsPanel } from "@/components/review/ReviewCommentsPanel";
import { ReviewRecommendationPanel } from "@/components/review/ReviewRecommendationPanel";
import { useReviewWorkspace } from "@/lib/hooks/useReviewWorkspace";
import { artifactReviewWorkspaceAdvisoryNote } from "@/lib/review/artifactReview";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import { reviewStateLevels } from "@/lib/review/reviewStatus";
import { useReviewWorkspaceStore } from "@/lib/store/reviewWorkspaceStore";
import { cn } from "@/lib/utils";
import { artifactLineageHref } from "@/lib/lineage/artifactLineageWorkspace";
import { crossReviewWorkspaceHref } from "@/lib/cross-review/crossRoleReviewWorkspace";

export function ArtifactReviewWorkspace({
  missions,
  tasks,
  initialMissionId,
  initialArtifactId,
}: {
  missions: Mission[];
  tasks: Task[];
  initialMissionId?: string | null;
  initialArtifactId?: string | null;
}) {
  const selectedMissionId = useReviewWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useReviewWorkspaceStore((s) => s.setSelectedMission);
  const selectedReviewState = useReviewWorkspaceStore((s) => s.selectedReviewState);
  const setSelectedReviewState = useReviewWorkspaceStore((s) => s.setSelectedReviewState);
  const selectedArtifactId = useReviewWorkspaceStore((s) => s.selectedArtifactId);
  const setSelectedArtifact = useReviewWorkspaceStore((s) => s.setSelectedArtifact);
  const setSelectedView = useReviewWorkspaceStore((s) => s.setSelectedView);
  const view = useReviewWorkspaceStore((s) => s.selectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;
  const filterArtifactId = selectedArtifactId ?? initialArtifactId ?? null;

  const { board, overview, timeline, comments, recommendations, selectedRecord } =
    useReviewWorkspace({
      missions,
      tasks,
      missionId: filterMissionId,
      reviewStateFilter: selectedReviewState,
      artifactId: filterArtifactId,
    });

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  useEffect(() => {
    if (initialArtifactId) setSelectedArtifact(initialArtifactId);
  }, [initialArtifactId, setSelectedArtifact]);

  const views = [
    { id: "board" as const, label: "Board" },
    { id: "timeline" as const, label: "Timeline" },
    { id: "comments" as const, label: "Comments" },
    { id: "recommendations" as const, label: "Recommendations" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{artifactReviewWorkspaceAdvisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Product Brief · Mission Plan · Technical Specification · UI Proposal · Implementation Plan ·
        QA Plan · Release Checklist · Validation Summary
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        {reviewStateLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() =>
              setSelectedReviewState(
                selectedReviewState === level.id ? null : (level.id as ReviewStateId)
              )
            }
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              selectedReviewState === level.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {level.title}
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

      {(view === "board" || view === "context") && (
        <Card title="Artifact Review Board" description="Review state across mission artifacts">
          <ArtifactReviewBoard rows={board} />
        </Card>
      )}

      {(view === "timeline" || view === "context") && (
        <Card
          title="Review Timeline"
          description={
            selectedRecord
              ? `${selectedRecord.artifactTitle} — ${selectedRecord.missionName}`
              : "Select an artifact from the board"
          }
        >
          <ArtifactReviewTimeline steps={timeline} />
        </Card>
      )}

      {(view === "comments" || view === "context") && (
        <Card title="Review Comments" description="Human-recorded comments only—not AI-generated">
          <ReviewCommentsPanel comments={comments} />
        </Card>
      )}

      {(view === "recommendations" || view === "context") && (
        <Card title="Review Recommendations" description="Advisory suggestions—human approval required">
          <ReviewRecommendationPanel recommendations={recommendations} />
        </Card>
      )}

      {(view === "summary" || view === "context") && (
        <Card title="Review Summary" description="Pending, in review, changes requested, and approved">
          <ArtifactReviewSummary summary={overview} />
        </Card>
      )}

      {filterMissionId ? (
        <Card title="Artifact Lineage" description="Trace why this artifact exists in the mission chain">
          <Link
            href={artifactLineageHref({
              missionId: filterMissionId,
              artifactId: filterArtifactId ?? selectedRecord?.artifactId,
            })}
            className="text-xs text-accent hover:underline"
          >
            Open Artifact Lineage
          </Link>
        </Card>
      ) : null}

      <Card title="Workspace Links" description="Team handoff and product lifecycle continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/artifact-lineage" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Lineage Workspace
          </Link>
          <Link
            href={crossReviewWorkspaceHref({
              missionId: filterMissionId ?? undefined,
              artifactId: filterArtifactId ?? selectedRecord?.artifactId,
            })}
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Review Workspace
          </Link>
          <Link href="/team-handoff" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI Team Handoff Workflow
          </Link>
          <Link href="/product-lifecycle" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Product Lifecycle Workspace
          </Link>
          <Link href="/coo-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI COO Workspace
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
