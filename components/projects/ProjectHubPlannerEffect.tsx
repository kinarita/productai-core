"use client";

import { useEffect } from "react";
import { agentRunKey } from "@/lib/agents/audit/agentAuditTypes";
import type { PlannerStoredRun } from "@/lib/agents/planner/plannerTypes";
import { migrateLegacyReviewReport } from "@/lib/coo-review/cooReviewMigration";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";

/** Starts or resumes planner generation when the hub loads. */
export function ProjectHubPlannerEffect({ missionId }: { missionId: string }) {
  const runStatus = useAgentRunsStore(
    (s) => s.runs[agentRunKey(missionId, "product_planner")]?.status
  );
  const hasCooReview = useAgentRunsStore((s) => {
    const meta = (s.runs[agentRunKey(missionId, "product_planner")] as PlannerStoredRun | undefined)
      ?.plannerMeta;
    return Boolean(
      meta?.cooReviewReport ?? migrateLegacyReviewReport(meta?.ceoReviewReport)
    );
  });
  const hasBrief = useAgentRunsStore(
    (s) =>
      !!(s.runs[agentRunKey(missionId, "product_planner")] as PlannerStoredRun | undefined)?.audit
        ?.output?.brief
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

    if (runStatus === "completed" && hasBrief && !hasCooReview) {
      void store.ensureCooReviewForMission(missionId);
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
  }, [missionId, runStatus, hasBrief, hasCooReview]);

  return null;
}
