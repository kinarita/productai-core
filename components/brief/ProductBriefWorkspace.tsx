"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission } from "@/types/productai";
import { Card } from "@/components/Card";
import { ProductBriefBoard } from "@/components/brief/ProductBriefBoard";
import { ProductBriefReviewPanel } from "@/components/brief/ProductBriefReviewPanel";
import { ProductBriefApprovalPanel } from "@/components/brief/ProductBriefApprovalPanel";
import { ProductBriefHistory } from "@/components/brief/ProductBriefHistory";
import { ProductBriefSummary } from "@/components/brief/ProductBriefSummary";
import { DirectorBriefPanel } from "@/components/brief/DirectorBriefPanel";
import { useProductBriefWorkspace } from "@/lib/hooks/useProductBriefWorkspace";
import { productBriefWorkspaceAdvisoryNote } from "@/lib/brief/productBriefWorkspace";
import type { ProductBriefStateId } from "@/lib/brief/productBriefStatus";
import { productBriefStateLevels } from "@/lib/brief/productBriefStatus";
import { useProductBriefWorkspaceStore } from "@/lib/store/productBriefWorkspaceStore";
import { cn } from "@/lib/utils";

export function ProductBriefWorkspace({
  missions,
  initialBriefId,
  initialMissionId,
}: {
  missions: Mission[];
  initialBriefId?: string | null;
  initialMissionId?: string | null;
}) {
  const selectedBriefId = useProductBriefWorkspaceStore((s) => s.selectedBriefId);
  const setSelectedBrief = useProductBriefWorkspaceStore((s) => s.setSelectedBrief);
  const selectedMissionId = useProductBriefWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useProductBriefWorkspaceStore((s) => s.setSelectedMission);
  const selectedStatus = useProductBriefWorkspaceStore((s) => s.selectedStatus);
  const setSelectedStatus = useProductBriefWorkspaceStore((s) => s.setSelectedStatus);
  const setSelectedView = useProductBriefWorkspaceStore((s) => s.setSelectedView);
  const view = useProductBriefWorkspaceStore((s) => s.selectedView);

  const filterBriefId = selectedBriefId ?? initialBriefId ?? null;
  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const {
    board,
    overview,
    selectedBrief,
    reviewContext,
    approvalContext,
    history,
    directorView,
    handoffCandidates,
    lifecycle,
    progressNote,
  } = useProductBriefWorkspace({
    missions,
    briefId: filterBriefId,
    missionId: filterMissionId,
    statusFilter: selectedStatus,
  });

  useEffect(() => {
    if (initialBriefId) setSelectedBrief(initialBriefId);
  }, [initialBriefId, setSelectedBrief]);

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  const views = [
    { id: "board" as const, label: "Board" },
    { id: "review" as const, label: "Review" },
    { id: "approval" as const, label: "Approval" },
    { id: "history" as const, label: "History" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{productBriefWorkspaceAdvisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        Planner → CEO Review → CEO Approval → Director Handoff Ready
      </div>

      {progressNote ? <p className="text-xs text-muted">{progressNote}</p> : null}

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
        {productBriefStateLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() =>
              setSelectedStatus(
                selectedStatus === level.id ? null : (level.id as ProductBriefStateId)
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

      {(view === "board" || view === "context") && (
        <Card title="Product Brief Board" description="Formal planning approval layer">
          <ProductBriefBoard rows={board} />
        </Card>
      )}

      {selectedBrief && reviewContext && (view === "review" || view === "context") && (
        <Card
          title="Review Panel"
          description={`${selectedBrief.title} — review support only`}
        >
          <ProductBriefReviewPanel context={reviewContext} brief={selectedBrief} />
        </Card>
      )}

      {selectedBrief && approvalContext && (view === "approval" || view === "context") && (
        <Card title="Approval Panel" description="CEO authorization visibility—human approval only">
          <ProductBriefApprovalPanel context={approvalContext} />
        </Card>
      )}

      {(view === "history" || view === "context") && (
        <Card title="Product Brief History" description="Draft through Director ready and archived">
          <ProductBriefHistory steps={history} />
        </Card>
      )}

      {(view === "summary" || view === "context") && (
        <Card title="Product Brief Summary" description="Organization-wide brief status">
          <ProductBriefSummary summary={overview} />
        </Card>
      )}

      {(view === "context") && (
        <Card title="Director View" description="Handoff-ready and planning queue">
          <DirectorBriefPanel view={directorView} />
        </Card>
      )}

      {handoffCandidates.length > 0 && (view === "context" || view === "approval") ? (
        <Card title="Director Handoff Candidates" description="Approved briefs—no automatic handoff">
          <ul className="space-y-2">
            {handoffCandidates.map((c) => (
              <li key={c.briefId} className="rounded-lg border border-border px-3 py-2 text-xs">
                <p className="font-medium">{c.title}</p>
                <p className="text-muted">{c.note}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link href={c.teamHandoffHref} className="text-accent hover:underline">
                    Team Handoff
                  </Link>
                  <Link href={c.artifactReviewHref} className="text-accent hover:underline">
                    Artifact Review
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card title="Lifecycle — Idea → Planning" description="Brief transition across product lifecycle">
        <p className="text-xs text-muted">{lifecycle.transitionNote}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">Idea Stage Briefs</p>
            <p className="text-lg font-semibold">{lifecycle.ideaStageBriefs}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">Planning Stage Briefs</p>
            <p className="text-lg font-semibold">{lifecycle.planningStageBriefs}</p>
          </div>
        </div>
        <Link href="/product-lifecycle" className="mt-3 inline-block text-xs text-accent hover:underline">
          Product Lifecycle Workspace
        </Link>
      </Card>

      <Card title="Workspace Links" description="Idea, review, and handoff continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/idea-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Idea Workspace
          </Link>
          <Link href="/artifact-review" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Review Workspace
          </Link>
          <Link href="/director-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Director Workspace
          </Link>
          <Link
            href={
              selectedBrief?.missionId
                ? `/director-workspace?brief=${selectedBrief.briefId}&mission=${selectedBrief.missionId}`
                : "/director-workspace"
            }
            className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
          >
            Open Director Workspace
          </Link>
          <Link href="/team-handoff" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI Team Handoff Workflow
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
