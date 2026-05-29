"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission } from "@/types/productai";
import { Card } from "@/components/Card";
import { IdeaCanvas } from "@/components/idea/IdeaCanvas";
import { ProblemDiscoveryPanel } from "@/components/idea/ProblemDiscoveryPanel";
import { ValuePropositionPanel } from "@/components/idea/ValuePropositionPanel";
import { MvpScopePanel } from "@/components/idea/MvpScopePanel";
import { FeaturePrioritizationPanel } from "@/components/idea/FeaturePrioritizationPanel";
import { ProductBriefPreview } from "@/components/idea/ProductBriefPreview";
import { IdeaSummaryCard } from "@/components/idea/IdeaSummaryCard";
import { useIdeaWorkspace } from "@/lib/hooks/useIdeaWorkspace";
import { ideaWorkspaceAdvisoryNote, ideaStateLevels } from "@/lib/idea/ideaWorkspace";
import type { IdeaStateId } from "@/lib/idea/ideaWorkspace";
import { buildProblemDiscovery } from "@/lib/idea/problemDiscovery";
import { buildValueProposition } from "@/lib/idea/valueProposition";
import { buildMvpScope } from "@/lib/idea/mvpScoping";
import { buildFeaturePrioritization } from "@/lib/idea/featurePrioritization";
import { useIdeaWorkspaceStore } from "@/lib/store/ideaWorkspaceStore";
import { cn } from "@/lib/utils";

export function CeoIdeaWorkspace({
  missions,
  initialIdeaId,
}: {
  missions: Mission[];
  initialIdeaId?: string | null;
}) {
  const selectedIdeaId = useIdeaWorkspaceStore((s) => s.selectedIdeaId);
  const setSelectedIdea = useIdeaWorkspaceStore((s) => s.setSelectedIdea);
  const selectedStatus = useIdeaWorkspaceStore((s) => s.selectedStatus);
  const setSelectedStatus = useIdeaWorkspaceStore((s) => s.setSelectedStatus);
  const setSelectedView = useIdeaWorkspaceStore((s) => s.setSelectedView);
  const view = useIdeaWorkspaceStore((s) => s.selectedView);

  const filterIdeaId = selectedIdeaId ?? initialIdeaId ?? null;

  const {
    ideas,
    selectedIdea,
    brief,
    overview,
    handoffReady,
    lifecycle,
    progressNote,
  } = useIdeaWorkspace({
    missions,
    ideaId: filterIdeaId,
    statusFilter: selectedStatus,
  });

  useEffect(() => {
    if (initialIdeaId) setSelectedIdea(initialIdeaId);
  }, [initialIdeaId, setSelectedIdea]);

  const views = [
    { id: "canvas" as const, label: "Canvas" },
    { id: "problem" as const, label: "Problem" },
    { id: "value" as const, label: "Value" },
    { id: "mvp" as const, label: "MVP" },
    { id: "features" as const, label: "Features" },
    { id: "brief" as const, label: "Brief" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{ideaWorkspaceAdvisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        CEO thinks · AI organizes · CEO approves — Idea → Product Planning → Product Brief
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Status:</span>
        <button
          type="button"
          onClick={() => setSelectedStatus(null)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs",
            !selectedStatus && "border-accent bg-accent/10 text-accent"
          )}
        >
          All
        </button>
        {ideaStateLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() =>
              setSelectedStatus(
                selectedStatus === level.id ? null : (level.id as IdeaStateId)
              )
            }
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              selectedStatus === level.id
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

      {(view === "canvas" || view === "context") && (
        <Card title="Idea Canvas" description="CEO ideas captured and refined toward Product Brief">
          <IdeaCanvas ideas={ideas} progressNote={progressNote} />
        </Card>
      )}

      {selectedIdea && (view === "problem" || view === "context") && (
        <Card title="Problem Discovery" description="Planner-organized problem framing">
          <ProblemDiscoveryPanel discovery={buildProblemDiscovery(selectedIdea)} />
        </Card>
      )}

      {selectedIdea && (view === "value" || view === "context") && (
        <Card title="Value Proposition" description="Expected value and differentiation">
          <ValuePropositionPanel proposition={buildValueProposition(selectedIdea)} />
        </Card>
      )}

      {selectedIdea && (view === "mvp" || view === "context") && (
        <Card title="MVP Scope" description="Must have through out of scope">
          <MvpScopePanel scope={buildMvpScope(selectedIdea)} />
        </Card>
      )}

      {selectedIdea && (view === "features" || view === "context") && (
        <Card title="Feature Prioritization" description="Visualization only">
          <FeaturePrioritizationPanel rows={buildFeaturePrioritization(selectedIdea)} />
        </Card>
      )}

      {selectedIdea && brief && (view === "brief" || view === "context") && (
        <Card title="Product Brief Preview" description="Draft for CEO review and authorization">
          <ProductBriefPreview brief={brief} idea={selectedIdea} />
        </Card>
      )}

      {(view === "summary" || view === "context") && (
        <Card title="Idea Summary" description="Ideas, drafts, and approved briefs">
          <IdeaSummaryCard summary={overview} />
        </Card>
      )}

      {handoffReady.length > 0 && (view === "context" || view === "brief") ? (
        <Card title="Director Hand-off Ready" description="Approved briefs—human coordination only">
          <ul className="space-y-2">
            {handoffReady.map((h) => (
              <li key={h.ideaId} className="rounded-lg border border-border px-3 py-2 text-xs">
                <p className="font-medium text-foreground">{h.title}</p>
                <p className="mt-1 text-muted">{h.handoffNote}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link href="/team-handoff" className="text-accent hover:underline">
                    Team Handoff
                  </Link>
                  <Link href={h.artifactReviewHref} className="text-accent hover:underline">
                    Artifact Review
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card title="Lifecycle Connection" description="Idea and Planning stages in Product Lifecycle">
        <p className="text-xs text-muted">{lifecycle.connectionNote}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">Idea Stage</p>
            <p className="text-lg font-semibold">{lifecycle.ideaStageCount}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">Planning Stage</p>
            <p className="text-lg font-semibold">{lifecycle.planningStageCount}</p>
          </div>
        </div>
        <Link href="/product-lifecycle" className="mt-3 inline-block text-xs text-accent hover:underline">
          Product Lifecycle Workspace
        </Link>
      </Card>

      <Card title="Workspace Links" description="Review, handoff, and mission continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/artifact-review" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Review Workspace
          </Link>
          <Link href="/product-brief" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Product Brief Workspace
          </Link>
          <Link href="/team-handoff" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI Team Handoff Workflow
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
          <Link href="/coo-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI COO Workspace
          </Link>
        </div>
      </Card>
    </div>
  );
}
