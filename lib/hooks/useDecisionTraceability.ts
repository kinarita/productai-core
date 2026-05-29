"use client";

import { useMemo } from "react";
import { buildDecisionTraceability } from "@/lib/orchestration/governance-history/traceabilityBuilder";
import { analyzeTraceability } from "@/lib/orchestration/governance-history/traceabilityAnalysis";
import { useDecisionMemoryAtlas } from "@/lib/hooks/useDecisionMemoryAtlas";
import { useGovernanceNarrativeStore } from "@/lib/store/governanceNarrativeStore";
import { useReplayInterpretationStore } from "@/lib/store/replayInterpretationStore";
import { useGovernanceJournalStore } from "@/lib/store/governanceJournalStore";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";

export function useDecisionTraceability(decisionAttention: DecisionAttentionItem[] = []) {
  const { atlas, graph } = useDecisionMemoryAtlas(decisionAttention);
  const narratives = useGovernanceNarrativeStore((s) => s.narratives);
  const journeys = useGovernanceNarrativeStore((s) => s.journeys);
  const interpretations = useReplayInterpretationStore((s) => s.records);
  const journals = useGovernanceJournalStore((s) => s.entries);

  const traceability = useMemo(
    () =>
      buildDecisionTraceability({
        atlas,
        graph,
        narratives,
        journals,
        interpretations,
        journeys,
        decisionAttention,
      }),
    [atlas, decisionAttention, graph, interpretations, journals, journeys, narratives]
  );

  const summary = useMemo(() => analyzeTraceability(traceability), [traceability]);

  return { traceability, summary, atlas, graph };
}
