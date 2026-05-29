"use client";

import { useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import type { DesignReviewStateId } from "@/lib/designer/designerWorkspace";
import { buildDesignerWorkspaceData } from "@/lib/designer/designerAnalysis";

export function useDesignerWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  userFlowId?: string | null;
  designSpecificationId?: string | null;
  reviewStateFilter?: DesignReviewStateId | null;
}) {
  const { missions, tasks, missionId, userFlowId, designSpecificationId, reviewStateFilter } =
    input;

  return useMemo(
    () =>
      buildDesignerWorkspaceData({
        missions,
        tasks,
        missionId,
        userFlowId,
        designSpecificationId,
        reviewStateFilter,
      }),
    [designSpecificationId, missionId, missions, reviewStateFilter, tasks, userFlowId]
  );
}
