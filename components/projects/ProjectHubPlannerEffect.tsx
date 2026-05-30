"use client";

import { useEffect } from "react";
import { agentRunKey } from "@/lib/agents/audit/agentAuditTypes";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";

/** Starts planner generation when the hub loads after project creation. */
export function ProjectHubPlannerEffect({ missionId }: { missionId: string }) {
  const runStatus = useAgentRunsStore(
    (s) => s.runs[agentRunKey(missionId, "product_planner")]?.status
  );

  useEffect(() => {
    if (runStatus !== "idle") return;
    void useAgentRunsStore.getState().generatePlannerForMission(missionId);
  }, [missionId, runStatus]);

  return null;
}
