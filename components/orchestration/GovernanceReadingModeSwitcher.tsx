"use client";

import {
  governanceReadingModes,
  type GovernanceReadingModeId,
} from "@/lib/orchestration/governance-history/readingModes";
import { useGovernanceWorkspaceStore } from "@/lib/store/governanceWorkspaceStore";
import { cn } from "@/lib/utils";

interface GovernanceReadingModeSwitcherProps {
  value?: GovernanceReadingModeId;
  onChange?: (mode: GovernanceReadingModeId) => void;
  compact?: boolean;
}

export function GovernanceReadingModeSwitcher({
  value,
  onChange,
  compact = false,
}: GovernanceReadingModeSwitcherProps) {
  const storeMode = useGovernanceWorkspaceStore((s) => s.activeReadingMode);
  const setActiveReadingMode = useGovernanceWorkspaceStore((s) => s.setActiveReadingMode);
  const active = value ?? storeMode;

  const handleChange = (mode: GovernanceReadingModeId) => {
    setActiveReadingMode(mode);
    onChange?.(mode);
  };

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <p className="text-xs font-medium uppercase text-muted">Governance reading mode</p>
      <div className="flex flex-wrap gap-1">
        {governanceReadingModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => handleChange(mode.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              active === mode.id
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border bg-background text-muted hover:bg-surface hover:text-foreground"
            )}
          >
            {mode.title}
          </button>
        ))}
      </div>
      {governanceReadingModes
        .filter((m) => m.id === active)
        .map((mode) => (
          <p key={mode.id} className="text-xs text-muted">
            {mode.description} · Focus: {mode.readingFocus}
          </p>
        ))}
    </div>
  );
}
