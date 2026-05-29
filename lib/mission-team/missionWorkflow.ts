import type { Mission, MissionLifecyclePhase } from "@/types/productai";
import type { MissionTeamRoleId } from "@/lib/mission-team/missionRoles";

export type MissionWorkflowStageId =
  | "ceo_idea"
  | "product_planning"
  | "ceo_authorization"
  | "mission_direction"
  | "architecture"
  | "design"
  | "development"
  | "qa"
  | "release"
  | "reflection";

export interface MissionWorkflowStage {
  id: MissionWorkflowStageId;
  title: string;
  description: string;
  primaryRole: MissionTeamRoleId | "ceo";
  cooCoordinates?: boolean;
}

export const missionWorkflowStages: MissionWorkflowStage[] = [
  {
    id: "ceo_idea",
    title: "CEO Idea",
    description: "Human CEO brings a product idea or opportunity into ProductAI.",
    primaryRole: "ceo",
  },
  {
    id: "product_planning",
    title: "Product Planning",
    description: "Product Planner refines scope, MVP, and value proposition.",
    primaryRole: "product_planner",
    cooCoordinates: true,
  },
  {
    id: "ceo_authorization",
    title: "CEO Authorization",
    description: "CEO reviews planning outputs and authorizes mission direction.",
    primaryRole: "ceo",
  },
  {
    id: "mission_direction",
    title: "Mission Direction",
    description: "Director plans delivery, tasks, schedule, and review coordination.",
    primaryRole: "director",
    cooCoordinates: true,
  },
  {
    id: "architecture",
    title: "Architecture",
    description: "Architect defines technical design and system boundaries.",
    primaryRole: "architect",
    cooCoordinates: true,
  },
  {
    id: "design",
    title: "Design",
    description: "Designer shapes UX, UI, and design system alignment.",
    primaryRole: "designer",
  },
  {
    id: "development",
    title: "Development",
    description: "Developer implements and refactors mission deliverables.",
    primaryRole: "developer",
  },
  {
    id: "qa",
    title: "QA",
    description: "QA Reviewer validates quality and records review notes.",
    primaryRole: "qa_reviewer",
  },
  {
    id: "release",
    title: "Release",
    description: "Release readiness and delivery handoff.",
    primaryRole: "director",
  },
  {
    id: "reflection",
    title: "Reflection",
    description: "Post-delivery reflection for continuity—not autonomous replanning.",
    primaryRole: "ceo",
  },
];

const lifecycleToStage: Record<MissionLifecyclePhase, MissionWorkflowStageId> = {
  Idea: "ceo_idea",
  Requirements: "product_planning",
  Specification: "product_planning",
  Architecture: "architecture",
  "UI/UX": "design",
  Implementation: "development",
  Review: "qa",
  Release: "release",
};

export function getWorkflowStage(id: MissionWorkflowStageId): MissionWorkflowStage {
  return missionWorkflowStages.find((s) => s.id === id) ?? missionWorkflowStages[0];
}

export function inferMissionWorkflowStage(mission: Mission): MissionWorkflowStageId {
  if (mission.status === "completed") return "reflection";
  if (mission.lifecycle === "Release" && mission.progress >= 90) return "release";
  return lifecycleToStage[mission.lifecycle] ?? "mission_direction";
}

export function getPrimaryRoleForMission(mission: Mission): MissionTeamRoleId {
  const stage = inferMissionWorkflowStage(mission);
  const workflow = getWorkflowStage(stage);
  return workflow.primaryRole === "ceo" ? "director" : workflow.primaryRole;
}

export interface MissionTeamOverviewBucket {
  id: string;
  label: string;
  stageIds: MissionWorkflowStageId[];
  activeMissions: Array<{ id: string; name: string; stageLabel: string }>;
}

export function buildMissionTeamOverview(missions: Mission[]): MissionTeamOverviewBucket[] {
  const buckets: MissionTeamOverviewBucket[] = [
    {
      id: "product_planning",
      label: "Active Product Planning",
      stageIds: ["ceo_idea", "product_planning", "ceo_authorization"],
      activeMissions: [],
    },
    {
      id: "mission_direction",
      label: "Active Mission Direction",
      stageIds: ["mission_direction"],
      activeMissions: [],
    },
    {
      id: "architecture",
      label: "Active Architecture",
      stageIds: ["architecture"],
      activeMissions: [],
    },
    {
      id: "development",
      label: "Active Development",
      stageIds: ["development", "design"],
      activeMissions: [],
    },
    {
      id: "qa",
      label: "Active QA",
      stageIds: ["qa", "release"],
      activeMissions: [],
    },
  ];

  for (const mission of missions.filter((m) => m.status === "active" || m.status === "planning")) {
    const stageId = inferMissionWorkflowStage(mission);
    const bucket = buckets.find((b) => b.stageIds.includes(stageId));
    if (bucket) {
      bucket.activeMissions.push({
        id: mission.id,
        name: mission.name,
        stageLabel: getWorkflowStage(stageId).title,
      });
    }
  }

  return buckets;
}

export function buildMissionTeamResponsibilityView(mission: Mission) {
  const stageId = inferMissionWorkflowStage(mission);
  const stage = getWorkflowStage(stageId);
  const primaryRole = getPrimaryRoleForMission(mission);
  return {
    stageId,
    stageTitle: stage.title,
    stageDescription: stage.description,
    primaryRole,
    primaryRoleTitle: stage.primaryRole === "ceo" ? "CEO" : stage.primaryRole.replaceAll("_", " "),
    cooCoordinates: stage.cooCoordinates ?? false,
    statusNote: `The product ${stage.title.toLowerCase()} stage is currently framing mission scope and delivery context for ${mission.name}.`,
  };
}
