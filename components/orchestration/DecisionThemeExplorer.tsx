"use client";

import { useMemo } from "react";
import type { DecisionMemoryAtlas } from "@/lib/orchestration/governance-history/decisionMemoryAtlas";
import { buildThemeExplorerView } from "@/lib/orchestration/governance-history/decisionMemoryAnalysis";
import {
  decisionThemeCatalog,
  type DecisionThemeId,
} from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import { useDecisionMemoryAtlasStore } from "@/lib/store/decisionMemoryAtlasStore";
import { cn } from "@/lib/utils";

function SectionList({ title, items }: { title: string; items: Array<{ id: string; title: string }> }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{title}</p>
      <ul className="mt-1 space-y-1 text-xs text-muted">
        {items.map((item) => (
          <li key={item.id}>- {item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export function DecisionThemeExplorer({
  atlas,
  compact = false,
}: {
  atlas: DecisionMemoryAtlas;
  compact?: boolean;
}) {
  const selectedTheme = useDecisionMemoryAtlasStore((s) => s.selectedTheme);
  const setSelectedTheme = useDecisionMemoryAtlasStore((s) => s.setSelectedTheme);
  const setSelectedNode = useDecisionMemoryAtlasStore((s) => s.setSelectedNode);

  const activeThemeId = selectedTheme ?? atlas.themes[0]?.id ?? decisionThemeCatalog[0].id;
  const view = useMemo(
    () => buildThemeExplorerView(atlas, activeThemeId),
    [activeThemeId, atlas]
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        Explore decision themes and their connected governance memory—interpretation support only.
      </p>
      <div className="flex flex-wrap gap-1">
        {(atlas.themes.length > 0 ? atlas.themes : decisionThemeCatalog).map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => setSelectedTheme(theme.id as DecisionThemeId)}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
              activeThemeId === theme.id
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border bg-background text-muted hover:bg-surface"
            )}
          >
            {theme.title}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">{view.themeTitle}</p>
        <p className="mt-1 text-xs text-muted">{view.themeDescription}</p>
      </div>
      <SectionList title="Related missions" items={view.relatedMissions} />
      <SectionList title="Related narratives" items={view.relatedNarratives} />
      <SectionList title="Related journals" items={view.relatedJournals} />
      <SectionList title="Related attention" items={view.relatedAttention} />
      {!compact ? (
        <>
          <SectionList title="Related interpretations" items={view.relatedInterpretations} />
          <SectionList title="Related review journeys" items={view.relatedJourneys} />
        </>
      ) : null}
      {view.relatedMissions[0] ? (
        <button
          type="button"
          onClick={() => setSelectedNode(view.relatedMissions[0].id)}
          className="text-xs font-medium text-accent hover:underline"
        >
          Inspect connected memory →
        </button>
      ) : null}
    </div>
  );
}
