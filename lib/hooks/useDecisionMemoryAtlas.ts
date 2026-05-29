"use client";

import { useMemo } from "react";
import { buildDecisionMemoryAtlas } from "@/lib/orchestration/governance-history/atlasBuilder";
import { analyzeDecisionMemoryAtlas } from "@/lib/orchestration/governance-history/decisionMemoryAnalysis";
import { useGovernanceKnowledgeGraph } from "@/lib/hooks/useGovernanceKnowledgeGraph";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";

export function useDecisionMemoryAtlas(decisionAttention: DecisionAttentionItem[] = []) {
  const { graph } = useGovernanceKnowledgeGraph(decisionAttention);
  const narratives = useGovernanceNarrativeStore((s) => s.narratives);
  const journeys = useGovernanceNarrativeStore((s) => s.journeys);
  const interpretations = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);

  const atlas = useMemo(
    () =>
      buildDecisionMemoryAtlas({
        narratives,
        journals,
        interpretations,
        journeys,
        decisionAttention,
        governanceGraph: graph,
      }),
    [decisionAttention, graph, interpretations, journals, journeys, narratives]
  );

  const summary = useMemo(() => analyzeDecisionMemoryAtlas(atlas), [atlas]);

  return { atlas, summary, graph };
}
