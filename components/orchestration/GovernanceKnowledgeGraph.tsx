"use client";

import { useEffect, useMemo } from "react";
import { inspectNodeRelationships } from "@/lib/orchestration/governance-history/relationshipAnalysis";
import { useGovernanceKnowledgeGraphStore } from "@/lib/store/governanceKnowledgeGraphStore";
import { useGovernanceKnowledgeGraph } from "@/lib/hooks/useGovernanceKnowledgeGraph";
import { KnowledgeGraphExplorer } from "@/components/orchestration/KnowledgeGraphExplorer";
import { KnowledgeGraphSummaryPanel } from "@/components/orchestration/KnowledgeGraphSummary";
import { RelationshipInspector } from "@/components/orchestration/RelationshipInspector";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";

export function GovernanceKnowledgeGraph({
  decisionAttention = [],
  compact = false,
  showSummary = true,
  showExplorer = true,
  showInspector = true,
}: {
  decisionAttention?: DecisionAttentionItem[];
  compact?: boolean;
  showSummary?: boolean;
  showExplorer?: boolean;
  showInspector?: boolean;
}) {
  const { graph, summary } = useGovernanceKnowledgeGraph(decisionAttention);
  const selectedNodeId = useGovernanceKnowledgeGraphStore((s) => s.selectedNodeId);
  const setSelectedNode = useGovernanceKnowledgeGraphStore((s) => s.setSelectedNode);
  const markViewed = useGovernanceKnowledgeGraphStore((s) => s.markViewed);

  useEffect(() => {
    markViewed();
  }, [markViewed]);

  const inspection = useMemo(
    () => (selectedNodeId ? inspectNodeRelationships(graph, selectedNodeId) : null),
    [graph, selectedNodeId]
  );

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-xs text-muted">
        This relationship view highlights connected governance themes for CEO understanding—what is
        happening, what matters, who is involved, and what may warrant human judgment next.
      </p>

      {showSummary ? (
        <div>
          {!compact ? (
            <p className="mb-2 text-xs font-medium uppercase text-muted">Knowledge graph summary</p>
          ) : null}
          <KnowledgeGraphSummaryPanel summary={summary} compact={compact} />
        </div>
      ) : null}

      <div className={compact ? "space-y-2" : "grid gap-4 lg:grid-cols-2"}>
        {showExplorer ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted">Graph explorer</p>
            <KnowledgeGraphExplorer graph={graph} compact={compact} />
          </div>
        ) : null}
        {showInspector ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted">Relationship inspector</p>
            <RelationshipInspector inspection={inspection} onSelectNode={setSelectedNode} />
          </div>
        ) : null}
      </div>

      <p className="text-[11px] text-muted">
        {graph.nodes.length} nodes · {graph.edges.length} relationships · generated{" "}
        {graph.generatedAt.slice(0, 16)}
      </p>
    </div>
  );
}
