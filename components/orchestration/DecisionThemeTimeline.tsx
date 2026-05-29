"use client";

import { useMemo } from "react";
import type { DecisionMemoryAtlas } from "@/lib/orchestration/governance-history/decisionMemoryAtlas";
import { buildDecisionThemeTimeline } from "@/lib/orchestration/governance-history/decisionMemoryAnalysis";
import type { DecisionThemeId } from "@/lib/orchestration/governance-history/decisionThemeCatalog";
import { useDecisionMemoryAtlasStore } from "@/lib/store/decisionMemoryAtlasStore";

function TimelineSection({
  label,
  entries,
}: {
  label: string;
  entries: Array<{ at: string; label: string }>;
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <ul className="mt-1 space-y-2 border-l border-border pl-3">
        {entries.map((entry) => (
          <li key={`${entry.at}-${entry.label}`} className="relative text-xs">
            <span className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-border" />
            <p className="text-[11px] text-muted">{entry.at.slice(0, 16)}</p>
            <p className="text-foreground">{entry.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DecisionThemeTimeline({
  atlas,
  themeId,
}: {
  atlas: DecisionMemoryAtlas;
  themeId?: DecisionThemeId;
}) {
  const selectedTheme = useDecisionMemoryAtlasStore((s) => s.selectedTheme);
  const activeThemeId = themeId ?? selectedTheme ?? atlas.themes[0]?.id;

  const timeline = useMemo(() => {
    if (!activeThemeId) return null;
    return buildDecisionThemeTimeline(atlas, activeThemeId);
  }, [activeThemeId, atlas]);

  if (!timeline) {
    return (
      <p className="text-xs text-muted">
        Select a theme to view past → present → continuing interpretation flow.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Timeline reading support for <span className="text-foreground">{timeline.themeTitle}</span>—not
        automated prioritization.
      </p>
      <p className="text-[11px] text-muted">{timeline.continuityLabel}</p>
      <TimelineSection label="Past" entries={timeline.past} />
      <TimelineSection label="Present" entries={timeline.present} />
      <TimelineSection label="Continuing themes" entries={timeline.continuing} />
    </div>
  );
}
