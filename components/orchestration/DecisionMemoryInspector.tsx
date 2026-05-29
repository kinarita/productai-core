"use client";

import { useMemo } from "react";
import type { DecisionMemoryAtlas } from "@/lib/orchestration/governance-history/decisionMemoryAtlas";
import {
  buildMissionDecisionContext,
  inspectDecisionMemoryNode,
} from "@/lib/orchestration/governance-history/decisionMemoryAnalysis";
import { atlasNodeTypeLabel } from "@/lib/orchestration/governance-history/decisionMemoryAtlas";
import { useDecisionMemoryAtlasStore } from "@/lib/store/decisionMemoryAtlasStore";
import { cn } from "@/lib/utils";

export function DecisionMemoryInspector({
  atlas,
  onSelectNode,
}: {
  atlas: DecisionMemoryAtlas;
  onSelectNode?: (id: string) => void;
}) {
  const selectedNodeId = useDecisionMemoryAtlasStore((s) => s.selectedNodeId);
  const setSelectedNode = useDecisionMemoryAtlasStore((s) => s.setSelectedNode);

  const inspection = useMemo(
    () => (selectedNodeId ? inspectDecisionMemoryNode(atlas, selectedNodeId) : null),
    [atlas, selectedNodeId]
  );

  if (!inspection) {
    return (
      <p className="text-xs text-muted">
        Select a memory node to review history, related themes, missions, journeys, and continuity notes.
      </p>
    );
  }

  const select = onSelectNode ?? setSelectedNode;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background px-3 py-2">
        <p className="text-sm font-medium text-foreground">{inspection.node.title}</p>
        <p className="text-[11px] text-muted">
          {atlasNodeTypeLabel(inspection.node.type)} · {inspection.node.createdAt.slice(0, 16)}
        </p>
        <p className="mt-1 text-xs text-muted">{inspection.history}</p>
      </div>
      {inspection.relatedThemes.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Related themes</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {inspection.relatedThemes.map((theme) => (
              <li
                key={theme.id}
                className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-muted"
              >
                {theme.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {inspection.relatedMissions.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted">
          <p className="text-xs font-medium uppercase text-muted">Related missions</p>
          {inspection.relatedMissions.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => select(m.id)} className="text-accent hover:underline">
                - {m.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {inspection.relatedJourneys.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted">
          <p className="text-xs font-medium uppercase text-muted">Related journeys</p>
          {inspection.relatedJourneys.map((j) => (
            <li key={j.id}>- {j.title}</li>
          ))}
        </ul>
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

export function MissionDecisionContextView({
  missionId,
  atlas,
}: {
  missionId: string;
  atlas: DecisionMemoryAtlas;
}) {
  const context = useMemo(
    () => buildMissionDecisionContext(atlas, missionId),
    [atlas, missionId]
  );

  if (!context) {
    return (
      <p className="text-xs text-muted">
        Decision context will appear when governance memory connects to this mission.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{context.summaryNote}</p>
      {context.relatedThemes.length > 0 ? (
        <p className="text-xs text-muted">
          Related themes: {context.relatedThemes.map((t) => t.title).join(", ")}
        </p>
      ) : null}
      <ul className="space-y-1 text-xs text-muted">
        <p className="font-medium uppercase text-muted">Related narratives</p>
        {context.relatedNarratives.length > 0 ? (
          context.relatedNarratives.map((n) => <li key={n.id}>- {n.title}</li>)
        ) : (
          <li>- None linked yet.</li>
        )}
      </ul>
      <ul className="space-y-1 text-xs text-muted">
        <p className="font-medium uppercase text-muted">Related attention</p>
        {context.relatedAttention.length > 0 ? (
          context.relatedAttention.map((a) => <li key={a.id}>- {a.title}</li>)
        ) : (
          <li>- None linked yet.</li>
        )}
      </ul>
      <ul className="space-y-1 text-xs text-muted">
        <p className="font-medium uppercase text-muted">Related review journeys</p>
        {context.relatedJourneys.length > 0 ? (
          context.relatedJourneys.map((j) => <li key={j.id}>- {j.title}</li>)
        ) : (
          <li>- None linked yet.</li>
        )}
      </ul>
    </div>
  );
}

export function DecisionMemoryNodeList({
  atlas,
  compact = false,
}: {
  atlas: DecisionMemoryAtlas;
  compact?: boolean;
}) {
  const selectedNodeId = useDecisionMemoryAtlasStore((s) => s.selectedNodeId);
  const setSelectedNode = useDecisionMemoryAtlasStore((s) => s.setSelectedNode);

  const entities = atlas.nodes.filter((n) => n.type !== "decision_theme");

  return (
    <ul className="max-h-48 space-y-1 overflow-y-auto">
      {entities.slice(0, compact ? 10 : 20).map((node) => (
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
            <p className="text-[11px] text-muted">{atlasNodeTypeLabel(node.type)}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
