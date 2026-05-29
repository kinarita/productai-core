"use client";

import { useMemo } from "react";
import { buildGovernanceKnowledgeGraph } from "@/lib/orchestration/governance-history/knowledgeGraphBuilder";
import { analyzeKnowledgeGraphRelationships } from "@/lib/orchestration/governance-history/relationshipAnalysis";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";

export function useGovernanceKnowledgeGraph(decisionAttention: DecisionAttentionItem[] = []) {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const interpretations = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);
  const narratives = useGovernanceNarrativeStore((s) => s.narratives);

  const graph = useMemo(
    () =>
      buildGovernanceKnowledgeGraph({
        missions,
        tasks,
        interpretations,
        journals,
        narratives,
        decisionAttention,
      }),
    [decisionAttention, interpretations, journals, missions, narratives, tasks]
  );

  const summary = useMemo(
    () => analyzeKnowledgeGraphRelationships(graph),
    [graph]
  );

  return { graph, summary };
}
