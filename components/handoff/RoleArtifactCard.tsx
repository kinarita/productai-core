"use client";

import type { HandoffArtifact } from "@/lib/handoff/handoffArtifacts";
import { useHandoffWorkspaceStore } from "@/lib/store/handoffWorkspaceStore";
import { cn } from "@/lib/utils";

export function RoleArtifactCard({
  artifact,
  compact = false,
}: {
  artifact: HandoffArtifact;
  compact?: boolean;
}) {
  const selectedArtifactId = useHandoffWorkspaceStore((s) => s.selectedArtifactId);
  const setSelectedArtifact = useHandoffWorkspaceStore((s) => s.setSelectedArtifact);

  return (
    <button
      type="button"
      onClick={() =>
        setSelectedArtifact(
          selectedArtifactId === artifact.id ? null : artifact.id
        )
      }
      className={cn(
        "w-full rounded-lg border border-border px-3 py-2 text-left transition hover:border-accent/40",
        selectedArtifactId === artifact.id && "border-accent/60 bg-accent/5",
        artifact.isPrimary && "ring-1 ring-accent/20"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-foreground">{artifact.title}</p>
        <span className="text-[10px] uppercase text-muted">{artifact.statusLabel}</span>
      </div>
      {!compact ? (
        <>
          <p className="mt-1 text-[10px] text-muted">{artifact.roleLabel}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted">{artifact.summary}</p>
        </>
      ) : null}
    </button>
  );
}
