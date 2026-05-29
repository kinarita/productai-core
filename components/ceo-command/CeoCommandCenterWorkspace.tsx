"use client";

import Link from "next/link";
import { useEffect } from "react";
import type {
  Mission,
  OrganizationFeedItem,
  ReleaseItem,
  Task,
  PullRequest,
  MemoryItem,
} from "@/types/productai";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import {
  ceoCommandCenterAdvisoryNote,
  ceoNavigationLinks,
  type CeoCommandCenterViewId,
  type CeoAttentionFilterId,
} from "@/lib/ceo-command/ceoCommandCenterWorkspace";
import { useCeoCommandCenter } from "@/lib/hooks/useCeoCommandCenter";
import { useCeoCommandCenterStore } from "@/lib/store/ceoCommandCenterStore";
import { ExecutiveOverviewPanel } from "@/components/ceo-command/ExecutiveOverviewPanel";
import { ProductPipelinePanel } from "@/components/ceo-command/ProductPipelinePanel";
import { MissionCommandTable } from "@/components/ceo-command/MissionCommandTable";
const views: { id: CeoCommandCenterViewId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline" },
  { id: "review", label: "Reviews" },
  { id: "mission", label: "Missions" },
  { id: "artifact", label: "Artifacts" },
  { id: "team", label: "Team" },
  { id: "feed", label: "Feed" },
  { id: "reading", label: "Reading" },
  { id: "snapshot", label: "Daily Snapshot" },
  { id: "hub", label: "Navigation" },
  { id: "context", label: "Full Context" },
];

const attentionFilters: { id: CeoAttentionFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reviews", label: "Reviews" },
  { id: "missions", label: "Missions" },
  { id: "lineage", label: "Lineage" },
  { id: "release", label: "Release" },
];

function SummaryGrid({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">{item.label}</p>
          <p className="text-lg font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CeoCommandCenterWorkspace({
  missions,
  tasks,
  feedItems,
  releases,
  memories,
  pullRequests,
  initialMissionId,
}: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
  releases: ReleaseItem[];
  memories: MemoryItem[];
  pullRequests: PullRequest[];
  initialMissionId?: string | null;
}) {
  const selectedMissionId = useCeoCommandCenterStore((s) => s.selectedMissionId);
  const setSelectedMission = useCeoCommandCenterStore((s) => s.setSelectedMission);
  const view = useCeoCommandCenterStore((s) => s.selectedView);
  const setSelectedView = useCeoCommandCenterStore((s) => s.setSelectedView);
  const attentionFilter = useCeoCommandCenterStore((s) => s.selectedAttentionFilter);
  const setAttentionFilter = useCeoCommandCenterStore((s) => s.setSelectedAttentionFilter);

  const filterMissionId = selectedMissionId ?? initialMissionId ?? null;

  const data = useCeoCommandCenter({
    missions,
    tasks,
    feedItems,
    releases,
    memories,
    pullRequests,
    missionId: filterMissionId,
    attentionFilter,
  });

  useEffect(() => {
    if (initialMissionId) setSelectedMission(initialMissionId);
  }, [initialMissionId, setSelectedMission]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{ceoCommandCenterAdvisoryNote}</p>
      {data.progressNote ? <p className="text-xs text-muted">{data.progressNote}</p> : null}

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
        <span className="text-xs text-muted">Attention:</span>
        {attentionFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setAttentionFilter(f.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition",
              attentionFilter === f.id
                ? "border-accent bg-accent/10 text-accent"
                : "text-muted hover:border-accent/40"
            )}
          >
            {f.label}
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
        <Card title="Executive Overview" description="Top-level CEO summary">
          <ExecutiveOverviewPanel overview={data.executiveOverview} />
        </Card>
      )}

      {(view === "pipeline" || view === "context") && (
        <Card title="Product Pipeline" description="Idea through release—stage counts">
          <ProductPipelinePanel stages={data.pipeline} />
        </Card>
      )}

      {(view === "review" || view === "context") && (
        <Card title="Review Attention" description="Cross-role review visibility—recommendations only">
          <SummaryGrid
            items={[
              { label: "Pending Reviews", value: data.reviewAttention.pendingReviews },
              { label: "Concentrations", value: data.reviewAttention.reviewConcentrations },
              { label: "Changes Requested", value: data.reviewAttention.changesRequested },
              { label: "Review Candidates", value: data.reviewAttention.reviewCandidates },
            ]}
          />
          <p className="mt-3 text-xs text-muted">{data.reviewAttention.advisoryNote}</p>
          <Link href="/review-workspace" className="mt-2 inline-block text-xs text-accent hover:underline">
            Open Review Workspace
          </Link>
        </Card>
      )}

      {(view === "mission" || view === "context") && (
        <Card title="Mission Attention" description="COO-aligned mission states—no prioritization">
          <SummaryGrid
            items={[
              { label: "Active", value: data.missionAttention.activeMissions },
              { label: "Blocked", value: data.missionAttention.blockedMissions },
              { label: "Planning", value: data.missionAttention.planningMissions },
              { label: "Release Ready", value: data.missionAttention.releaseReadyMissions },
            ]}
          />
          <p className="mt-3 text-xs text-muted">{data.missionAttention.advisoryNote}</p>
          <Link href="/coo-workspace" className="mt-2 inline-block text-xs text-accent hover:underline">
            Open COO Workspace
          </Link>
        </Card>
      )}

      {(view === "artifact" || view === "context") && (
        <Card title="Artifact Health" description="Lineage and review coverage">
          <SummaryGrid
            items={[
              { label: "Complete Lineages", value: data.artifactHealth.completeLineages },
              { label: "Incomplete Lineages", value: data.artifactHealth.incompleteLineages },
              { label: "Active Artifacts", value: data.artifactHealth.activeArtifacts },
              { label: "Review Coverage %", value: data.artifactHealth.reviewCoverage },
            ]}
          />
          <p className="mt-3 text-xs text-muted">{data.artifactHealth.advisoryNote}</p>
          <Link href="/artifact-lineage" className="mt-2 inline-block text-xs text-accent hover:underline">
            Open Artifact Lineage
          </Link>
        </Card>
      )}

      {(view === "team" || view === "context") && (
        <Card title="Team Activity" description="Active work, reviews, and handoffs by role">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-2 py-2 text-left">Role</th>
                  <th className="px-2 py-2 text-center">Active Work</th>
                  <th className="px-2 py-2 text-center">Reviews</th>
                  <th className="px-2 py-2 text-center">Handoffs</th>
                </tr>
              </thead>
              <tbody>
                {data.teamActivity.map((row) => (
                  <tr key={row.role} className="border-b border-border/60">
                    <td className="px-2 py-2 font-medium">{row.roleLabel}</td>
                    <td className="px-2 py-2 text-center">{row.activeWork}</td>
                    <td className="px-2 py-2 text-center">{row.reviews}</td>
                    <td className="px-2 py-2 text-center">{row.handoffs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(view === "feed" || view === "context") && (
        <Card title="Executive Feed" description="Summarized organization feed">
          <ul className="space-y-2">
            {data.executiveFeed.map((item) => (
              <li key={item.id} className="rounded-lg border border-border px-3 py-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="font-medium uppercase text-muted">{item.category}</span>
                  <span className="text-[10px] text-muted">{item.timestamp}</span>
                </div>
                <p className="mt-1 text-foreground">{item.missionName}</p>
                <p className="text-muted">{item.message}</p>
              </li>
            ))}
          </ul>
          <Link href="/organization-feed" className="mt-3 inline-block text-xs text-accent hover:underline">
            Open Organization Feed
          </Link>
        </Card>
      )}

      {(view === "reading" || view === "context") && (
        <Card title="Recommended Reading" description="Advisory suggestions only">
          <ul className="space-y-2">
            {data.recommendedReading.map((item) => (
              <li key={item.title} className="rounded-lg border border-border px-3 py-2 text-xs">
                <Link href={item.href} className="font-medium text-accent hover:underline">
                  {item.title}
                </Link>
                <p className="mt-1 text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(view === "snapshot" || view === "context") && (
        <Card title="CEO Daily Snapshot" description="Daily reading summary">
          <SummaryGrid
            items={[
              { label: "Ideas In Progress", value: data.dailySnapshot.ideasInProgress },
              { label: "Briefs Under Review", value: data.dailySnapshot.briefsUnderReview },
              { label: "Architecture Reviews", value: data.dailySnapshot.architectureReviews },
              { label: "Design Reviews", value: data.dailySnapshot.designReviews },
              { label: "Development Reviews", value: data.dailySnapshot.developmentReviews },
              { label: "QA Reviews", value: data.dailySnapshot.qaReviews },
              { label: "Release Candidates", value: data.dailySnapshot.releaseCandidates },
            ]}
          />
          <p className="mt-3 text-xs text-muted">{data.dailySnapshot.advisoryNote}</p>
        </Card>
      )}

      {(view === "mission" || view === "context" || filterMissionId) && (
        <Card title="Mission Deep Links" description="Lifecycle, lineage, review, and workspace">
          <MissionCommandTable rows={data.missionRows} />
        </Card>
      )}

      {(view === "hub" || view === "context") && (
        <Card title="CEO Navigation Hub" description="Jump to any ProductAI workspace">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ceoNavigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/ceo-home" className="rounded-lg border border-border px-3 py-2 text-xs text-accent hover:underline">
              CEO Home
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
