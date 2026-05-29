"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Mission, Task } from "@/types/productai";
import { Card } from "@/components/Card";
import { HandoffFlowView } from "@/components/handoff/HandoffFlowView";
import { HandoffStatusBoard } from "@/components/handoff/HandoffStatusBoard";
import { HandoffArtifactPanel } from "@/components/handoff/HandoffArtifactPanel";
import { HandoffTimeline } from "@/components/handoff/HandoffTimeline";
import { HandoffSummaryCard } from "@/components/handoff/HandoffSummaryCard";
import { useHandoffWorkspace } from "@/lib/hooks/useHandoffWorkspace";
import { buildHandoffCandidates, buildProductBriefRecords } from "@/lib/brief/productBriefAnalysis";
import { handoffWorkspaceAdvisoryNote } from "@/lib/handoff/handoffWorkflow";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import { handoffFlowSteps } from "@/lib/handoff/handoffWorkflow";
import { useHandoffWorkspaceStore } from "@/lib/store/handoffWorkspaceStore";
import { cn } from "@/lib/utils";
import { buildHandoffLineageContextItems } from "@/lib/lineage/artifactLineageAnalysis";
import { ArtifactLineageHandoffPanel } from "@/components/lineage/ArtifactLineageHandoffPanel";
import { useMemo } from "react";

export function TeamHandoffWorkspace({
  missions,
  tasks,
  initialMissionId,
}: {
  missions: Mission[];
  tasks: Task[];
  initialMissionId?: string | null;
}) {
  const selectedMissionId = useHandoffWorkspaceStore((s) => s.selectedMissionId);
  const setSelectedMission = useHandoffWorkspaceStore((s) => s.setSelectedMission);
  const selectedRole = useHandoffWorkspaceStore((s) => s.selectedRole);
  const setSelectedRole = useHandoffWorkspaceStore((s) => s.setSelectedRole);
  const setSelectedView = useHandoffWorkspaceStore((s) => s.setSelectedView);
  const view = useHandoffWorkspaceStore((s) => s.selectedView);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const { artifacts, flow, board, overview, timeline, missionContext } = useHandoffWorkspace({
    missions,
    tasks,
    missionId: filterMissionId,
    roleFilter: selectedRole,
  });

  const briefHandoffCandidates = buildHandoffCandidates(buildProductBriefRecords(missions));

  const lineageHandoffItems = useMemo(
    () => buildHandoffLineageContextItems({ missions, tasks }),
    [missions, tasks]
  );

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  const views = [
    { id: "flow" as const, label: "Flow" },
    { id: "board" as const, label: "Board" },
    { id: "artifacts" as const, label: "Artifacts" },
    { id: "timeline" as const, label: "Timeline" },
    { id: "summary" as const, label: "Summary" },
    { id: "context" as const, label: "Context" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{handoffWorkspaceAdvisoryNote}</p>

      <div className="rounded-lg border border-border bg-muted/5 px-4 py-3 text-xs text-muted">
        CEO Idea → Product Planner → Director → Architect → Designer → Developer → QA Reviewer → Release
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
        {handoffFlowSteps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() =>
              setSelectedRole(
                selectedRole === step.id ? null : (step.id as HandoffRoleId)
              )
            }
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              selectedRole === step.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {step.title}
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

      {(view === "flow" || view === "context") && (
        <Card title="Handoff Flow" description="AI team role relay from CEO idea through release">
          <HandoffFlowView flow={flow} />
        </Card>
      )}

      {(view === "board" || view === "context") && (
        <Card title="Handoff Status Board" description="Artifacts grouped by handoff status">
          <HandoffStatusBoard board={board} />
        </Card>
      )}

      {(view === "artifacts" || view === "context") && (
        <Card title="Handoff Artifacts" description="Role deliverables across the product workflow">
          <HandoffArtifactPanel artifacts={artifacts} />
        </Card>
      )}

      {(view === "timeline" || view === "context") && (
        <Card title="Handoff Timeline" description="Artifact created through next role started">
          <HandoffTimeline steps={timeline} />
        </Card>
      )}

      {(view === "timeline" || view === "context") && (
        <Card
          title="Artifact Lineage Context"
          description="Source and destination artifacts across active missions"
        >
          <ArtifactLineageHandoffPanel items={lineageHandoffItems} compact={view === "timeline"} />
        </Card>
      )}

      {(view === "summary" || view === "context") && (
        <Card title="Handoff Summary" description="Active artifacts, reviews, and completed handoffs">
          <HandoffSummaryCard summary={overview} />
        </Card>
      )}

      {missionContext && (view === "context" || filterMissionId) ? (
        <Card
          title={`Mission Context — ${missionContext.missionName}`}
          description={`Current role: ${missionContext.currentRoleLabel}`}
        >
          <p className="mb-3 text-xs text-muted">{missionContext.progressNote}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border px-3 py-2">
              <p className="text-[10px] uppercase text-muted">Current Artifact</p>
              <p className="text-sm">{missionContext.currentArtifact}</p>
            </div>
            <div className="rounded-lg border border-border px-3 py-2">
              <p className="text-[10px] uppercase text-muted">Next Handoff</p>
              <p className="text-sm">{missionContext.nextHandoffRoleLabel ?? "—"}</p>
            </div>
          </div>
        </Card>
      ) : null}

      {briefHandoffCandidates.length > 0 ? (
        <Card title="Director Handoff Candidates" description="Approved Product Briefs—no automatic handoff">
          <ul className="space-y-2">
            {briefHandoffCandidates.map((c) => (
              <li key={c.briefId} className="rounded-lg border border-border px-3 py-2 text-xs">
                <p className="font-medium text-foreground">{c.title}</p>
                <p className="text-muted">{c.note}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link href={c.teamHandoffHref} className="text-accent hover:underline">
                    Team Handoff
                  </Link>
                  <Link href={`/product-brief?brief=${c.briefId}`} className="text-accent hover:underline">
                    Product Brief
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card title="Workspace Links" description="Product lifecycle and delivery continuity">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/product-lifecycle" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Product Lifecycle Workspace
          </Link>
          <Link href="/coo-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            AI COO Workspace
          </Link>
          <Link href="/delivery-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Mission Delivery Workspace
          </Link>
          <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Home
          </Link>
          <Link href="/artifact-review" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Review Workspace
          </Link>
          <Link href="/artifact-lineage" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            Artifact Lineage Workspace
          </Link>
          <Link href="/idea-workspace" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
            CEO Idea Workspace
          </Link>
        </div>
      </Card>
    </div>
  );
}
