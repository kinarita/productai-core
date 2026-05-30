"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { agentRunKey } from "@/lib/agents/audit/agentAuditTypes";
import { toPlannerAgentRun } from "@/lib/agents/audit/plannerRunAdapter";
import type { PlannerAgentRun, PlannerStoredRun } from "@/lib/agents/planner/plannerTypes";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";

/** Subscribe to the stored planner run, adapt once per store update (avoids re-render churn). */
export function usePlannerRunForMission(missionId: string): PlannerAgentRun | undefined {
  const stored = useAgentRunsStore(
    useShallow(
      (s) =>
        s.runs[agentRunKey(missionId, "product_planner")] as PlannerStoredRun | undefined
    )
  );
  return useMemo(() => toPlannerAgentRun(stored), [stored]);
}
