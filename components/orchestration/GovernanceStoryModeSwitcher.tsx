"use client";

import {
  governanceStoryModes,
  type GovernanceStoryModeId,
} from "@/lib/orchestration/governance-history/storyModes";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import { cn } from "@/lib/utils";

export function GovernanceStoryModeSwitcher({ compact = false }: { compact?: boolean }) {
  const activeStoryMode = useGovernanceNarrativeStore((s) => s.activeStoryMode);
  const setActiveStoryMode = useGovernanceNarrativeStore((s) => s.setActiveStoryMode);

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <p className="text-xs font-medium uppercase text-muted">Governance story mode</p>
      <div className="flex flex-wrap gap-1">
        {governanceStoryModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setActiveStoryMode(mode.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              activeStoryMode === mode.id
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border bg-background text-muted hover:bg-surface"
            )}
          >
            {mode.title}
          </button>
        ))}
      </div>
      {governanceStoryModes
        .filter((m) => m.id === activeStoryMode)
        .map((mode) => (
          <p key={mode.id} className="text-xs text-muted">
            {mode.description}
          </p>
        ))}
    </div>
  );
}
