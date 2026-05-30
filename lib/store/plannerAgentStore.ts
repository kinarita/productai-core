"use client";

/**
 * Phase 14 compatibility facade — planner logic lives in agentRunsStore (Phase 15).
 */
import { useShallow } from "zustand/react/shallow";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";

export type PlannerAgentStoreSlice = {
  getRun: (missionId: string) => PlannerAgentRun | undefined;
  initRun: (missionId: string, input: ProjectCreationInput) => void;
  generateForMission: (missionId: string) => Promise<void>;
  submitClarification: (missionId: string, answers: Record<string, string>) => Promise<void>;
  retryGeneration: (missionId: string) => Promise<void>;
};

const plannerSlice = (state: ReturnType<typeof useAgentRunsStore.getState>): PlannerAgentStoreSlice => ({
  getRun: state.getPlannerRun,
  initRun: state.initPlannerRun,
    generateForMission: state.generatePlannerForMission,
    submitClarification: state.submitPlannerClarification,
    retryGeneration: state.retryPlannerGeneration,
});

export function usePlannerAgentStore<T>(selector: (slice: PlannerAgentStoreSlice) => T): T {
  return useAgentRunsStore(useShallow((state) => selector(plannerSlice(state))));
}

usePlannerAgentStore.getState = (): PlannerAgentStoreSlice =>
  plannerSlice(useAgentRunsStore.getState());
