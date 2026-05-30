"use client";

import type { DiscoveryMode } from "@/lib/project-creation/projectCreationTypes";
import {
  discoveryModeLabels,
  discoveryModeRecommendationCopy,
  discoveryModeSectionLabel,
} from "@/lib/project-creation/discoveryModeLabels";
import { cn } from "@/lib/utils";

export function DiscoveryModeSelector({
  discoveryMode,
  onDiscoveryModeChange,
  idea,
  showRecommendation = true,
}: {
  discoveryMode: DiscoveryMode;
  onDiscoveryModeChange: (mode: DiscoveryMode) => void;
  idea: string;
  showRecommendation?: boolean;
}) {
  const recommendation = discoveryModeRecommendationCopy(idea);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{discoveryModeSectionLabel}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["quick", "guided"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onDiscoveryModeChange(mode)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              discoveryMode === mode
                ? "border-accent bg-indigo-50/60"
                : "border-border hover:border-accent/40"
            )}
          >
            <p className="text-sm font-semibold text-foreground">
              {mode === "quick" ? "🚀 " : "🎯 "}
              {discoveryModeLabels[mode].title}
            </p>
            <p className="mt-1 text-xs text-muted">{discoveryModeLabels[mode].description}</p>
          </button>
        ))}
      </div>
      {showRecommendation ? (
        <p className="rounded-lg border border-border/80 bg-surface px-3 py-2 text-xs text-muted">
          <span className="font-medium text-foreground">{recommendation.headline}</span>
          <br />
          {recommendation.body}
        </p>
      ) : null}
    </div>
  );
}
