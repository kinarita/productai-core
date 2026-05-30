"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CreatedProjectMeta,
  ProjectActivityItem,
  ProjectCreationInput,
} from "@/lib/project-creation/projectCreationTypes";
import { buildMissionFromProjectInput } from "@/lib/project-creation/createProject";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { usePlannerAgentStore } from "@/lib/store/plannerAgentStore";

function activityId(): string {
  return `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

interface ProjectCreationState {
  projects: CreatedProjectMeta[];
  activities: ProjectActivityItem[];
  createProject: (input: ProjectCreationInput) => string;
  getActivitiesForMission: (missionId: string) => ProjectActivityItem[];
  getMetaForMission: (missionId: string) => CreatedProjectMeta | undefined;
}

export const useProjectCreationStore = create<ProjectCreationState>()(
  persist(
    (set, get) => ({
      projects: [],
      activities: [],

      createProject: (input) => {
        const mission = buildMissionFromProjectInput(input);
        const missionId = mission.id;
        const timestamp = nowLabel();

        useMissionStore.setState((state) => ({
          missions: [mission, ...state.missions],
          selectedMissionId: missionId,
        }));

        usePlannerAgentStore.getState().initRun(missionId, input);

        const seedActivities: ProjectActivityItem[] = [
          {
            id: activityId(),
            missionId,
            workerEmoji: "✨",
            workerName: "You",
            message: `Started project "${mission.name}"`,
            timestamp,
          },
          {
            id: activityId(),
            missionId,
            workerEmoji: "🧠",
            workerName: "Product Planner",
            message: "assigned — analysis will begin",
            timestamp,
          },
        ];

        const meta: CreatedProjectMeta = {
          missionId,
          idea: input.idea,
          targetUsers: input.targetUsers,
          successGoal: input.successGoal,
          createdAt: new Date().toISOString(),
          plannerStatus: "pending",
          productBriefGenerated: false,
        };

        set((state) => ({
          projects: [meta, ...state.projects],
          activities: [...seedActivities, ...state.activities].slice(0, 120),
        }));

        useOrganizationStore.getState().addFeedItemWithSync({
          type: "coordination",
          author: "COO",
          authorName: "Nova",
          missionId,
          missionName: mission.name,
          message: `AI team started for "${mission.name}" — Product Planner is analyzing your input.`,
          status: "active",
          requiresCeoApproval: false,
        });

        return missionId;
      },

      getActivitiesForMission: (missionId) =>
        get().activities.filter((a) => a.missionId === missionId),

      getMetaForMission: (missionId) =>
        get().projects.find((p) => p.missionId === missionId),
    }),
    {
      name: "productai-project-creation",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        activities: state.activities,
      }),
    }
  )
);
