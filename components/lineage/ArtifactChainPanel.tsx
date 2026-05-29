"use client";

import { cn } from "@/lib/utils";
import type { LineageChainNode } from "@/lib/lineage/artifactChain";

export function ArtifactChainPanel({
  chain,
  selectedArtifactId,
  onSelect,
}: {
  chain: LineageChainNode[];
  selectedArtifactId: string | null;
  onSelect: (node: LineageChainNode) => void;
}) {
  return (
    <div className="space-y-0">
      {chain.map((node, index) => (
        <div key={node.stepId} className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => onSelect(node)}
            className={cn(
              "w-full max-w-md rounded-lg border px-4 py-3 text-left transition",
              selectedArtifactId === node.artifactId
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/40"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{node.artifactName}</p>
                <p className="text-[10px] uppercase text-muted">{node.artifactType}</p>
              </div>
              <span className="text-[10px] text-muted">{node.status}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
              <span>{node.ownerRoleLabel}</span>
              <span>·</span>
              <span>{node.lastUpdated}</span>
            </div>
          </button>
          {index < chain.length - 1 ? (
            <div className="flex h-8 flex-col items-center justify-center text-muted" aria-hidden>
              <span className="text-lg leading-none">↓</span>
            </div>
          ) : null}
        </div>
      ))}
      <p className="mt-3 text-[10px] text-muted">
        Click a node to inspect summary, dependencies, and review traceability.
      </p>
    </div>
  );
}
