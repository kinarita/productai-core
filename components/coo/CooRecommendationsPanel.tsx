"use client";

import type { CooRecommendationsBundle } from "@/lib/coo/cooRecommendations";
import { useCooWorkspaceStore } from "@/lib/store/cooWorkspaceStore";
import { cn } from "@/lib/utils";

function RecommendationList({
  title,
  items,
  compact,
}: {
  title: string;
  items: CooRecommendationsBundle["recommendedReviewAreas"];
  compact?: boolean;
}) {
  const selectedId = useCooWorkspaceStore((s) => s.selectedRecommendationId);
  const setSelected = useCooWorkspaceStore((s) => s.setSelectedRecommendation);

  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.slice(0, compact ? 2 : 4).map((rec) => (
          <li key={rec.id}>
            <button
              type="button"
              onClick={() => setSelected(selectedId === rec.id ? null : rec.id)}
              className={cn(
                "w-full rounded-lg border border-border px-3 py-2 text-left transition hover:border-accent/40",
                selectedId === rec.id && "border-accent/60 bg-accent/5"
              )}
            >
              <p className="text-xs font-medium text-foreground">{rec.title}</p>
              <p className="mt-1 text-xs text-muted">{rec.detail}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CooRecommendationsPanel({
  recommendations,
  compact = false,
}: {
  recommendations: CooRecommendationsBundle;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <RecommendationList
        title="Recommended Review Areas"
        items={recommendations.recommendedReviewAreas}
        compact={compact}
      />
      <RecommendationList
        title="Suggested Follow-up"
        items={recommendations.suggestedFollowUp}
        compact={compact}
      />
      <RecommendationList
        title="Mission Requiring Coordination"
        items={recommendations.missionsRequiringCoordination}
        compact={compact}
      />
      <RecommendationList
        title="Cross-Team Dependencies"
        items={recommendations.crossTeamDependencies}
        compact={compact}
      />
      {!compact ? (
        <p className="text-xs text-muted">{recommendations.advisoryNote}</p>
      ) : null}
    </div>
  );
}

export function CooWorkspaceSummaryPanel({
  summary,
  compact = false,
}: {
  summary: import("@/lib/coo/cooWorkflowSummary").CooWorkspaceSummary;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Active Missions</p>
          <p className="text-lg font-semibold">{summary.activeMissions}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Potential Bottlenecks</p>
          <p className="text-lg font-semibold">{summary.potentialBottlenecks}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Review Concentrations</p>
          <p className="text-lg font-semibold">{summary.reviewConcentrations}</p>
        </div>
      </div>
      {summary.missionDistribution.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Mission Distribution</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {summary.missionDistribution.slice(0, compact ? 4 : 8).map((d) => (
              <li key={d.stage}>
                {d.title}: {d.missionCount}
                {!compact && d.missionNames.length > 0
                  ? ` (${d.missionNames.slice(0, 2).join(", ")})`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-xs text-muted">{summary.advisoryNote}</p>
    </div>
  );
}
