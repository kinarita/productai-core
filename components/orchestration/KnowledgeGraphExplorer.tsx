"use client";

import { useMemo } from "react";
import type { KnowledgeGraph } from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";
import {
  nodeTypeLabel,
  type KnowledgeGraphNodeType,
} from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";
import { useGovernanceKnowledgeGraphStore } from "@/lib/store/governanceKnowledgeGraphStore";
import { cn } from "@/lib/utils";

const filterOptions: Array<{ id: string; label: string; type?: KnowledgeGraphNodeType }> = [
  { id: "all", label: "All" },
  { id: "mission", label: "Missions", type: "mission" },
  { id: "task", label: "Tasks", type: "task" },
  { id: "attention", label: "Attention", type: "attention" },
  { id: "interpretation", label: "Interpretations", type: "interpretation" },
  { id: "journal", label: "Journals", type: "journal" },
  { id: "narrative", label: "Narratives", type: "narrative" },
  { id: "replay", label: "Replay", type: "replay" },
  { id: "executive_role", label: "Executive roles", type: "executive_role" },
];

export function KnowledgeGraphExplorer({
  graph,
  compact = false,
}: {
  graph: KnowledgeGraph;
  compact?: boolean;
}) {
  const selectedNodeId = useGovernanceKnowledgeGraphStore((s) => s.selectedNodeId);
  const explorerFilter = useGovernanceKnowledgeGraphStore((s) => s.explorerFilter);
  const setSelectedNode = useGovernanceKnowledgeGraphStore((s) => s.setSelectedNode);
  const setExplorerFilter = useGovernanceKnowledgeGraphStore((s) => s.setExplorerFilter);

  const filteredNodes = useMemo(() => {
    const option = filterOptions.find((o) => o.id === explorerFilter);
    if (!option || option.id === "all") return graph.nodes;
    return graph.nodes.filter((n) => n.type === option.type);
  }, [explorerFilter, graph.nodes]);

  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const edge of graph.edges) {
      counts.set(edge.sourceId, (counts.get(edge.sourceId) ?? 0) + 1);
      counts.set(edge.targetId, (counts.get(edge.targetId) ?? 0) + 1);
    }
    return counts;
  }, [graph.edges]);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs text-muted">
        The graph supports interpretation continuity across governance entities—relationship-oriented
        reading only.
      </p>
      <div className="flex flex-wrap gap-1">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setExplorerFilter(option.id)}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
              explorerFilter === option.id
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border bg-background text-muted hover:bg-surface"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul className="max-h-64 space-y-1 overflow-y-auto">
        {filteredNodes.slice(0, compact ? 12 : 24).map((node) => (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => setSelectedNode(node.id)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                selectedNodeId === node.id
                  ? "border-accent bg-indigo-50"
                  : "border-border bg-background hover:bg-surface"
              )}
            >
              <p className="font-medium text-foreground">{node.title}</p>
              <p className="text-[11px] text-muted">
                {nodeTypeLabel(node.type)} · {connectionCounts.get(node.id) ?? 0} connections
              </p>
            </button>
          </li>
        ))}
        {filteredNodes.length === 0 ? (
          <li className="text-xs text-muted">No nodes match this filter.</li>
        ) : null}
      </ul>
    </div>
  );
}
