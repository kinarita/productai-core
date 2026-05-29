"use client";

import { useMemo } from "react";
import type { Mission } from "@/types/productai";
import type { ProductBriefStateId } from "@/lib/brief/productBriefStatus";
import { buildProductBriefWorkspaceData } from "@/lib/brief/productBriefAnalysis";

export function useProductBriefWorkspace(input: {
  missions: Mission[];
  briefId?: string | null;
  missionId?: string | null;
  statusFilter?: ProductBriefStateId | null;
}) {
  const { missions, briefId, missionId, statusFilter } = input;

  return useMemo(
    () =>
      buildProductBriefWorkspaceData({
        missions,
        briefId,
        missionId,
        statusFilter,
      }),
    [briefId, missionId, missions, statusFilter]
  );
}
