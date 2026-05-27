"use client";

import { useEffect } from "react";
import { useUiStore } from "@/lib/store/uiStore";
import { useMissionStore } from "@/lib/store/missionStore";

export function useMissionFilterFromUrl(missionId: string | undefined) {
  const setActiveMission = useUiStore((s) => s.setActiveMission);
  const setSelectedMission = useMissionStore((s) => s.setSelectedMission);

  useEffect(() => {
    if (missionId) {
      setActiveMission(missionId);
      setSelectedMission(missionId);
    }
  }, [missionId, setActiveMission, setSelectedMission]);
}
