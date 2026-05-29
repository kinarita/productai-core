"use client";

import { useMemo } from "react";
import type { Mission } from "@/types/productai";
import type { IdeaStateId } from "@/lib/idea/ideaWorkspace";
import { buildIdeaWorkspaceData } from "@/lib/idea/ideaAnalysis";

export function useIdeaWorkspace(input: {
  missions: Mission[];
  ideaId?: string | null;
  statusFilter?: IdeaStateId | null;
}) {
  const { missions, ideaId, statusFilter } = input;

  return useMemo(
    () =>
      buildIdeaWorkspaceData({
        missions,
        ideaId,
        statusFilter,
      }),
    [ideaId, missions, statusFilter]
  );
}
