"use client";

import { useMemo } from "react";
import type { DecisionTraceability } from "@/lib/orchestration/governance-history/decisionTraceability";
import {
  buildMissionDecisionPathView,
  inspectTraceabilityNode,
} from "@/lib/orchestration/governance-history/traceabilityAnalysis";
import { traceNodeTypeLabel } from "@/lib/orchestration/governance-history/decisionTraceability";
import { useDecisionTraceabilityStore } from "@/lib/store/decisionTraceabilityStore";
import { cn } from "@/lib/utils";

export function TraceabilityInspector({
  traceability,
  onSelectNode,
}: {
  traceability: DecisionTraceability;
  onSelectNode?: (id: string) => void;
}) {
  const selectedNodeId = useDecisionTraceabilityStore((s) => s.selectedNodeId);
  const setSelectedNode = useDecisionTraceabilityStore((s) => s.setSelectedNode);
  const select = onSelectNode ?? setSelectedNode;

  const inspection = useMemo(
    () => (selectedNodeId ? inspectTraceabilityNode(traceability, selectedNodeId) : null),
    [selectedNodeId, traceability]
  );

  if (!inspection) {
    return (
      <p className="text-xs text-muted">
        Select a trace node to review incoming and outgoing relationships, connected pathways, and review
        history.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">{inspection.node.title}</p>
        <p className="text-[11px] text-muted">
          {traceNodeTypeLabel(inspection.node.type)} · {inspection.node.createdAt.slice(0, 16)}
        </p>
        <p className="mt-1 text-xs text-muted">{inspection.reviewHistory}</p>
      </div>

      {inspection.incoming.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Incoming relationships</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {inspection.incoming.map((rel) => (
              <li key={`${rel.fromId}-${rel.relationshipType}`}>
                <button
                  type="button"
                  onClick={() => select(rel.fromId)}
                  className="text-accent hover:underline"
                >
                  {rel.fromTitle}
                </button>{" "}
                · {rel.relationshipType}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {inspection.outgoing.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Outgoing relationships</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {inspection.outgoing.map((rel) => (
              <li key={`${rel.toId}-${rel.relationshipType}`}>
                <button
                  type="button"
                  onClick={() => select(rel.toId)}
                  className="text-accent hover:underline"
                >
                  {rel.toTitle}
                </button>{" "}
                · {rel.relationshipType}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {inspection.connectedPathways.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Connected pathways</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {inspection.connectedPathways.map((p) => (
              <li key={p.id}>- {p.title}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium uppercase text-muted">Continuity notes</p>
        <ul className="mt-1 space-y-1 text-xs text-muted">
          {inspection.continuityNotes.map((note) => (
            <li key={note}>- {note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MissionDecisionPathView({
  missionId,
  traceability,
}: {
  missionId: string;
  traceability: DecisionTraceability;
}) {
  const view = useMemo(
    () => buildMissionDecisionPathView(traceability, missionId),
    [missionId, traceability]
  );

  if (!view) {
    return (
      <p className="text-xs text-muted">
        Mission decision paths will appear when traceability connects to this mission.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{view.summaryNote}</p>
      {view.relatedThemes.length > 0 ? (
        <p className="text-xs text-muted">Related themes: {view.relatedThemes.join(", ")}</p>
      ) : null}
      <ul className="space-y-1 text-xs text-muted">
        <p className="font-medium uppercase text-muted">Related pathways</p>
        {view.relatedPathways.length > 0 ? (
          view.relatedPathways.map((p) => <li key={p.id}>- {p.title}</li>)
        ) : (
          <li>- None linked yet.</li>
        )}
      </ul>
      <ul className="space-y-1 text-xs text-muted">
        <p className="font-medium uppercase text-muted">Related narratives</p>
        {view.relatedNarratives.map((n) => (
          <li key={n.id}>- {n.title}</li>
        ))}
      </ul>
      <ul className="space-y-1 text-xs text-muted">
        <p className="font-medium uppercase text-muted">Related attention</p>
        {view.relatedAttention.map((a) => (
          <li key={a.id}>- {a.title}</li>
        ))}
      </ul>
    </div>
  );
}

export function TraceabilityNodeList({
  traceability,
  compact = false,
}: {
  traceability: DecisionTraceability;
  compact?: boolean;
}) {
  const selectedNodeId = useDecisionTraceabilityStore((s) => s.selectedNodeId);
  const setSelectedNode = useDecisionTraceabilityStore((s) => s.setSelectedNode);

  return (
    <ul className="max-h-48 space-y-1 overflow-y-auto">
      {traceability.nodes.slice(0, compact ? 10 : 20).map((node) => (
        <li key={node.id}>
          <button
            type="button"
            onClick={() => setSelectedNode(node.id)}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left text-xs",
              selectedNodeId === node.id
                ? "border-accent bg-indigo-50"
                : "border-border bg-background hover:bg-surface"
            )}
          >
            <p className="font-medium text-foreground">{node.title}</p>
            <p className="text-[11px] text-muted">{traceNodeTypeLabel(node.type)}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
