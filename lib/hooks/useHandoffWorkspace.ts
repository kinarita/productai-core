"use client";

import { useMemo } from "react";
import type { Mission, Task } from "@/types/productai";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import {
  buildHandoffArtifacts,
  buildHandoffFlowView,
  buildHandoffOverviewSummary,
  buildHandoffStatusBoard,
  buildHandoffTimeline,
  buildMissionHandoffContext,
  buildCooHandoffCoordination,
  buildCeoHandoffSummary,
} from "@/lib/handoff/handoffAnalysis";

export function useHandoffWorkspace(input: {
  missions: Mission[];
  tasks: Task[];
  missionId?: string | null;
  roleFilter?: HandoffRoleId | null;
}) {
  const { missions, tasks, missionId, roleFilter } = input;

  const artifacts = useMemo(
    () => buildHandoffArtifacts({ missions, missionId, roleFilter }),
    [missionId, missions, roleFilter]
  );

  const flow = useMemo(() => buildHandoffFlowView({ missions }), [missions]);

  const board = useMemo(() => buildHandoffStatusBoard(artifacts), [artifacts]);

  const overview = useMemo(() => buildHandoffOverviewSummary({ missions }), [missions]);

  const ceoSummary = useMemo(() => buildCeoHandoffSummary({ missions }), [missions]);

  const cooCoordination = useMemo(() => buildCooHandoffCoordination({ missions }), [missions]);

  const selectedMission = missionId ? missions.find((m) => m.id === missionId) : null;

  const timeline = useMemo(() => {
    const mission = selectedMission ?? missions[0];
    if (!mission) return [];
    const missionArtifacts = buildHandoffArtifacts({ missions: [mission] });
    return buildHandoffTimeline({ mission, artifacts: missionArtifacts });
  }, [missions, selectedMission]);

  const missionContext = useMemo(() => {
    if (!selectedMission) return null;
    return buildMissionHandoffContext({ mission: selectedMission, tasks });
  }, [selectedMission, tasks]);

  return {
    artifacts,
    flow,
    board,
    overview,
    ceoSummary,
    cooCoordination,
    timeline,
    missionContext,
  };
}
