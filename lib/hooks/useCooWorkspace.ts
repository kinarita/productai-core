"use client";

import { useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import type { DecisionAttentionItem } from "@/lib/orchestration/decision-attention/decisionAttention";
import {
  buildCooMissionBoard,
  buildCooMissionPipeline,
} from "@/lib/coo/cooMissionAnalysis";
import { detectCooBottlenecks } from "@/lib/coo/cooBottleneckDetection";
import {
  buildCooWorkflowSummary,
  buildCooWorkspaceSummary,
} from "@/lib/coo/cooWorkflowSummary";
import { buildCooRecommendations } from "@/lib/coo/cooRecommendations";

export function useCooWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  decisionAttention: DecisionAttentionItem[];
}) {
  const pipeline = useMemo(
    () => buildCooMissionPipeline({ missions: input.missions, decisionAttention: input.decisionAttention }),
    [input.decisionAttention, input.missions]
  );

  const board = useMemo(
    () => buildCooMissionBoard({ missions: input.missions, tasks: input.tasks }),
    [input.missions, input.tasks]
  );

  const bottlenecks = useMemo(
    () =>
      detectCooBottlenecks({
        missions: input.missions,
        tasks: input.tasks,
        decisionAttention: input.decisionAttention,
      }),
    [input.decisionAttention, input.missions, input.tasks]
  );

  const workflow = useMemo(
    () => buildCooWorkflowSummary(input.missions),
    [input.missions]
  );

  const recommendations = useMemo(
    () =>
      buildCooRecommendations({
        missions: input.missions,
        tasks: input.tasks,
        bottlenecks,
      }),
    [bottlenecks, input.missions, input.tasks]
  );

  const summary = useMemo(
    () =>
      buildCooWorkspaceSummary({
        missions: input.missions,
        bottleneckCount: bottlenecks.length,
        reviewConcentrationCount: bottlenecks.filter((b) => b.category === "attention_concentration")
          .length,
      }),
    [bottlenecks, input.missions]
  );

  return { pipeline, board, bottlenecks, workflow, recommendations, summary };
}
