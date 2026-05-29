import {
  cooCoordinationNote,
  getMissionTeamRole,
  missionTeamRoles,
  type MissionTeamRoleId,
} from "@/lib/mission-team/missionRoles";

export interface RoleResponsibilityDetail {
  roleId: MissionTeamRoleId;
  title: string;
  responsibilities: string[];
  deliverables: string[];
  coordinationNote?: string;
}

export const roleResponsibilityDetails: RoleResponsibilityDetail[] = missionTeamRoles.map(
  (role) => ({
    roleId: role.id,
    title: role.title,
    responsibilities: getResponsibilitiesForRole(role.id),
    deliverables: role.deliverables,
    coordinationNote:
      role.id === "product_planner" || role.id === "director" || role.id === "architect"
        ? cooCoordinationNote
        : undefined,
  })
);

function getResponsibilitiesForRole(roleId: MissionTeamRoleId): string[] {
  switch (roleId) {
    case "product_planner":
      return [
        "Organize CEO ideas and user problems",
        "Clarify value proposition and MVP scope",
        "Prioritize features for executive-readable planning",
        "Draft product brief and feature proposals",
      ];
    case "director":
      return [
        "Plan mission delivery and task decomposition",
        "Coordinate schedules and assignments",
        "Align review cadence and risk sharing",
        "Maintain delivery plan visibility for CEO",
      ];
    case "architect":
      return [
        "Define system design and technical boundaries",
        "Select technologies and document tradeoffs",
        "Shape data models and API contracts",
      ];
    case "designer":
      return ["Own UX flows", "Define UI patterns", "Align design system usage"];
    case "developer":
      return [
        "Implement mission features",
        "Refactor for maintainability",
        "Resolve technical issues with traceability",
      ];
    case "qa_reviewer":
      return [
        "Confirm quality through structured review",
        "Record QA findings for human judgment",
        "Support release readiness checks",
      ];
    default:
      return [];
  }
}

export function getRoleResponsibility(roleId: MissionTeamRoleId): RoleResponsibilityDetail {
  return (
    roleResponsibilityDetails.find((r) => r.roleId === roleId) ??
    roleResponsibilityDetails[0]
  );
}

export function getCooOversightRoles(): RoleResponsibilityDetail[] {
  return ["product_planner", "director", "architect"].map((id) =>
    getRoleResponsibility(id as MissionTeamRoleId)
  );
}
