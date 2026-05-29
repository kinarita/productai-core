"use client";

import { useEffect } from "react";
import { useDecisionMemoryAtlas } from "@/lib/hooks/useDecisionMemoryAtlas";
import { useDecisionMemoryAtlasStore } from "@/lib/store/decisionMemoryAtlasStore";
import { DecisionAtlasSummaryPanel } from "@/components/orchestration/DecisionAtlasSummary";
import { DecisionThemeExplorer } from "@/components/orchestration/DecisionThemeExplorer";
import {
  DecisionMemoryInspector,
  DecisionMemoryNodeList,
} from "@/components/orchestration/DecisionMemoryInspector";
import { DecisionThemeTimeline } from "@/components/orchestration/DecisionThemeTimeline";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import { cn } from "@/lib/utils";

export function ExecutiveDecisionMemoryAtlas({
  decisionAttention = [],
  compact = false,
  showSummary = true,
  showThemes = true,
  showTimeline = true,
  showInspector = true,
}: {
  decisionAttention?: DecisionAttentionItem[];
  compact?: boolean;
  showSummary?: boolean;
  showThemes?: boolean;
  showTimeline?: boolean;
  showInspector?: boolean;
}) {
  const { atlas, summary } = useDecisionMemoryAtlas(decisionAttention);
  const activeAtlasView = useDecisionMemoryAtlasStore((s) => s.activeAtlasView);
  const setActiveAtlasView = useDecisionMemoryAtlasStore((s) => s.setActiveAtlasView);
  const markThemeViewed = useDecisionMemoryAtlasStore((s) => s.markThemeViewed);
  const selectedTheme = useDecisionMemoryAtlasStore((s) => s.selectedTheme);

  useEffect(() => {
    if (selectedTheme) markThemeViewed(selectedTheme);
  }, [markThemeViewed, selectedTheme]);

  const views = [
    { id: "summary" as const, label: "Summary" },
    { id: "themes" as const, label: "Themes" },
    { id: "timeline" as const, label: "Timeline" },
    { id: "inspector" as const, label: "Inspector" },
  ];

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-xs text-muted">
        This atlas highlights recurring decision themes observed across governance reviews. It supports
        what you may want to re-read—not what the system decided.
      </p>

      {!compact ? (
        <div className="flex flex-wrap gap-1">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveAtlasView(view.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                activeAtlasView === view.id
                  ? "border-accent bg-indigo-50 text-accent"
                  : "border-border bg-background text-muted hover:bg-surface"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>
      ) : null}

      {(activeAtlasView === "summary" || compact) && showSummary ? (
        <DecisionAtlasSummaryPanel summary={summary} compact={compact} />
      ) : null}

      {(activeAtlasView === "themes" || compact) && showThemes ? (
        <div>
          {!compact ? (
            <p className="mb-2 text-xs font-medium uppercase text-muted">Decision theme explorer</p>
          ) : null}
          <DecisionThemeExplorer atlas={atlas} compact={compact} />
        </div>
      ) : null}

      {(activeAtlasView === "timeline" || compact) && showTimeline ? (
        <div>
          {!compact ? (
            <p className="mb-2 text-xs font-medium uppercase text-muted">Decision theme timeline</p>
          ) : null}
          <DecisionThemeTimeline atlas={atlas} />
        </div>
      ) : null}

      {(activeAtlasView === "inspector" || compact) && showInspector ? (
        <div className={compact ? "space-y-2" : "grid gap-4 lg:grid-cols-2"}>
          <div>
            {!compact ? (
              <p className="mb-2 text-xs font-medium uppercase text-muted">Memory nodes</p>
            ) : null}
            <DecisionMemoryNodeList atlas={atlas} compact={compact} />
          </div>
          <div>
            {!compact ? (
              <p className="mb-2 text-xs font-medium uppercase text-muted">Decision memory inspector</p>
            ) : null}
            <DecisionMemoryInspector atlas={atlas} />
          </div>
        </div>
      ) : null}

      <p className="text-[11px] text-muted">
        {atlas.nodes.length} memory nodes · {atlas.themes.length} active themes · layered on knowledge
        graph
      </p>
    </div>
  );
}
