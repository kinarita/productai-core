"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import type { ArtifactLineageViewId } from "@/lib/lineage/artifactLineageWorkspace";
import { useArtifactLineage } from "@/lib/hooks/useArtifactLineage";
import { useArtifactLineageStore } from "@/lib/store/artifactLineageStore";
import { LineageOverviewPanel } from "@/components/lineage/LineageOverviewPanel";
import { ArtifactChainPanel } from "@/components/lineage/ArtifactChainPanel";
import { ArtifactInspectorPanel } from "@/components/lineage/ArtifactInspectorPanel";
import { DependencyContextPanel } from "@/components/lineage/DependencyContextPanel";
import { ReviewTraceabilityPanel } from "@/components/lineage/ReviewTraceabilityPanel";
import { TeamOwnershipPanel } from "@/components/lineage/TeamOwnershipPanel";
import { ArtifactLineageSummary } from "@/components/lineage/ArtifactLineageSummary";
import type { LineageChainNode } from "@/lib/lineage/artifactChain";

const views: { id: ArtifactLineageViewId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "chain", label: "Artifact Chain" },
  { id: "inspector", label: "Inspector" },
  { id: "dependency", label: "Dependencies" },
  { id: "review_trace", label: "Review Trace" },
  { id: "ownership", label: "Ownership" },
  { id: "summary", label: "Summary" },
  { id: "context", label: "Full Context" },
];

export function ArtifactLineageWorkspace({
  missions,
  tasks,
  feedItems,
  initialMissionId,
  initialArtifactId,
}: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  initialMissionId?: string | null;
  initialArtifactId?: string | null;
}) {
  const selectedMissionId = useArtifactLineageStore((s) => s.selectedMissionId);
  const setSelectedMission = useArtifactLineageStore((s) => s.setSelectedMission);
  const selectedArtifactId = useArtifactLineageStore((s) => s.selectedArtifactId);
  const setSelectedArtifact = useArtifactLineageStore((s) => s.setSelectedArtifact);
  const view = useArtifactLineageStore((s) => s.selectedView);
  const setSelectedView = useArtifactLineageStore((s) => s.setSelectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;
  const filterArtifactId = selectedArtifactId ?? initialArtifactId ?? null;

  const { rows, context, overview, progressNote } = useArtifactLineage({
    missions,
    tasks,
    feedItems,
    missionId: filterMissionId,
    artifactId: filterArtifactId,
  });

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  useEffect(() => {
    if (initialArtifactId) setSelectedArtifact(initialArtifactId);
  }, [initialArtifactId, setSelectedArtifact]);

  const handleSelectNode = (node: LineageChainNode) => {
    setSelectedArtifact(node.artifactId);
    setSelectedView("inspector");
  };

  const activeArtifactId =
    filterArtifactId ?? context?.selectedNode.artifactId ?? null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{overview.advisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Idea → Product Brief → Mission Plan → Technical Specification → Design Specification →
        Implementation Plan → Test Plan
      </div>

      {progressNote ? <p className="text-xs text-muted">{progressNote}</p> : null}

      {rows.length > 0 ? (
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
          {rows.map((row) => (
            <button
              key={row.missionId}
              type="button"
              onClick={() => setSelectedMission(row.missionId)}
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
      ) : null}

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
        <Card title="Lineage Summary" description="Across missions">
          <ArtifactLineageSummary summary={overview} />
        </Card>
      )}

      {context && (view === "overview" || view === "context") && (
        <Card title="Lineage Overview" description="Mission and role context">
          <LineageOverviewPanel context={context} />
        </Card>
      )}

      {context && (view === "chain" || view === "context") && (
        <Card title="Artifact Chain" description="Vertical lineage—click to inspect">
          <ArtifactChainPanel
            chain={context.chain}
            selectedArtifactId={activeArtifactId}
            onSelect={handleSelectNode}
          />
        </Card>
      )}

      {context && (view === "inspector" || view === "context") && (
        <Card title="Artifact Inspector" description={context.selectedNode.artifactName}>
          <ArtifactInspectorPanel inspector={context.inspector} />
        </Card>
      )}

      {context && (view === "dependency" || view === "context") && (
        <Card title="Dependency Context" description="Parent, child, and lifecycle links">
          <DependencyContextPanel view={context.dependency} />
        </Card>
      )}

      {context && (view === "review_trace" || view === "context") && (
        <Card title="Review Traceability" description="Human review history only">
          <ReviewTraceabilityPanel view={context.reviewTrace} />
        </Card>
      )}

      {(view === "ownership" || view === "context") && (
        <Card title="Team Ownership" description="Artifact → owner role">
          <TeamOwnershipPanel rows={context?.ownership ?? []} />
        </Card>
      )}

      <Card title="Workspace Links" description="Trace lineage across ProductAI">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/artifact-review" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Review
          </Link>
          <Link href="/review-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Review Workspace
          </Link>
          <Link href="/team-handoff" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Team Handoff
          </Link>
          <Link href="/product-lifecycle" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Product Lifecycle
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
