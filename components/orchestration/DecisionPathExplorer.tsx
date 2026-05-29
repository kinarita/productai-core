"use client";

import { useMemo } from "react";
import type { DecisionTraceability } from "@/lib/orchestration/governance-history/decisionTraceability";
import { buildPathExplorerView } from "@/lib/orchestration/governance-history/traceabilityAnalysis";
import { useDecisionTraceabilityStore } from "@/lib/store/decisionTraceabilityStore";
import { cn } from "@/lib/utils";

export function DecisionPathExplorer({
  traceability,
  compact = false,
}: {
  traceability: DecisionTraceability;
  compact?: boolean;
}) {
  const selectedNodeId = useDecisionTraceabilityStore((s) => s.selectedNodeId);
  const selectedPathwayId = useDecisionTraceabilityStore((s) => s.selectedPathwayId);
  const setSelectedNode = useDecisionTraceabilityStore((s) => s.setSelectedNode);
  const setSelectedPathway = useDecisionTraceabilityStore((s) => s.setSelectedPathway);

  const activeNodeId =
    selectedNodeId ??
    traceability.pathways.find((p) => p.id === selectedPathwayId)?.nodeIds[0] ??
    traceability.nodes.find((n) => n.type === "interpretation")?.id;

  const explorer = useMemo(
    () => (activeNodeId ? buildPathExplorerView(traceability, activeNodeId) : null),
    [activeNodeId, traceability]
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        This pathway illustrates how governance interpretations became connected over time—explainability
        only.
      </p>

      {!compact ? (
        <div className="flex flex-wrap gap-1">
          {traceability.pathways.slice(0, 8).map((pathway) => (
            <button
              key={pathway.id}
              type="button"
              onClick={() => setSelectedPathway(pathway.id)}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                selectedPathwayId === pathway.id
                  ? "border-accent bg-indigo-50 text-accent"
                  : "border-border bg-background text-muted hover:bg-surface"
              )}
            >
              {pathway.title.slice(0, 36)}
            </button>
          ))}
        </div>
      ) : null}

      {explorer ? (
        <ol className="space-y-2 border-l border-border pl-3">
          {explorer.steps.map((step) => (
            <li key={step.node.id} className="relative text-xs">
              <span className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-border" />
              <p className="text-[11px] uppercase text-muted">{step.layer}</p>
              <button
                type="button"
                onClick={() => setSelectedNode(step.node.id)}
                className="font-medium text-foreground hover:text-accent"
              >
                {step.node.title}
              </button>
              <p className="text-muted">{step.node.description.slice(0, 100)}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-muted">Select a pathway or node to explore connected decision context.</p>
      )}
    </div>
  );
}
