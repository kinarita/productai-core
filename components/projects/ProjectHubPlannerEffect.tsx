"use client";

import { useEffect } from "react";
import { agentRunKey } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerStoredRun } from "@/lib/agents/planner/plannerTypes";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";

/** Starts or resumes planner generation when the hub loads. */
export function ProjectHubPlannerEffect({ missionId }: { missionId: string }) {
  const runStatus = useAgentRunsStore(
    (s) => s.runs[agentRunKey(missionId, "product_planner")]?.status
  );

  useEffect(() => {
    const store = useAgentRunsStore.getState();
    const stored = store.runs[agentRunKey(missionId, "product_planner")] as
      | PlannerStoredRun
      | undefined;

    if (runStatus === "idle") {
      void store.generatePlannerForMission(missionId);
      return;
    }

    if (
      runStatus === "working" ||
      runStatus === "failed" ||
      runStatus === "assessing"
    ) {
      const meta = stored?.plannerMeta;
      const incomplete =
        !!meta?.lastAssessment &&
        (!meta.opportunityBrief || !meta.cpfReport || !meta.psfReport || !stored?.audit?.output?.brief);

      if (incomplete) {
        void store.resumePlannerPipeline(missionId);
      }
    }
  }, [missionId, runStatus]);

  return null;
}
