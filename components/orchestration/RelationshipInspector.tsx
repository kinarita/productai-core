"use client";

import { useMemo } from "react";
import type { KnowledgeGraph } from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";
import type { NodeRelationshipInspection } from "@/lib/orchestration/governance-history/relationshipAnalysis";
import { buildMissionRelationshipView } from "@/lib/orchestration/governance-history/relationshipAnalysis";
import {
  nodeTypeLabel,
  relationshipTypeLabel,
} from "@/lib/orchestration/governance-history/governanceKnowledgeGraph";

function RelatedList({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; description?: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{title}</p>
      <ul className="mt-1 space-y-1 text-xs text-muted">
        {items.map((item) => (
          <li key={item.id}>
            - {item.title}
            {item.description ? (
              <span className="block text-[11px] text-muted">{item.description.slice(0, 100)}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RelationshipInspector({
  inspection,
  onSelectNode,
}: {
  inspection: NodeRelationshipInspection | null;
  onSelectNode?: (id: string) => void;
}) {
  if (!inspection) {
    return (
      <p className="text-xs text-muted">
        Select a node to inspect connected missions, journals, narratives, attention, and replay context.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">{inspection.node.title}</p>
        <p className="text-[11px] text-muted">
          {nodeTypeLabel(inspection.node.type)} · {inspection.node.createdAt.slice(0, 16)}
        </p>
        <p className="mt-1 text-xs text-muted">{inspection.node.description}</p>
      </div>

      <RelatedList title="Related missions" items={inspection.relatedMissions} />
      <RelatedList title="Related journals" items={inspection.relatedJournals} />
      <RelatedList title="Related narratives" items={inspection.relatedNarratives} />
      <RelatedList title="Related attention" items={inspection.relatedAttention} />
      <RelatedList title="Related replay" items={inspection.relatedReplay} />
      <RelatedList title="Related interpretations" items={inspection.relatedInterpretations} />
      <RelatedList title="Related tasks" items={inspection.relatedTasks} />
      <RelatedList title="Related executive roles" items={inspection.relatedExecutiveRoles} />

      {inspection.connectedEdges.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Relationships</p>
          <ul className="mt-1 space-y-1 text-[11px] text-muted">
            {inspection.connectedEdges.slice(0, 8).map((edge) => (
              <li key={edge.id}>
                {relationshipTypeLabel(edge.relationshipType)} ·{" "}
                <button
                  type="button"
                  onClick={() => onSelectNode?.(edge.targetId === inspection.node.id ? edge.sourceId : edge.targetId)}
                  className="text-accent hover:underline"
                >
                  connected node
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function MissionRelationshipView({
  missionId,
  graph,
}: {
  missionId: string;
  graph: KnowledgeGraph;
}) {
  const view = useMemo(
    () => buildMissionRelationshipView(graph, missionId),
    [graph, missionId]
  );

  if (!view) {
    return (
      <p className="text-xs text-muted">
        Mission relationship context will appear when governance nodes connect to this mission.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{view.summaryNote}</p>
      <RelatedList title="Narratives" items={view.narratives} />
      <RelatedList title="Journals" items={view.journals} />
      <RelatedList title="Decision attention" items={view.attention} />
      <RelatedList title="Interpretations" items={view.interpretations} />
      <RelatedList title="Replay context" items={view.replay} />
      <RelatedList title="Executive roles" items={view.executiveRoles} />
    </div>
  );
}
