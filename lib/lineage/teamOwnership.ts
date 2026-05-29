import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import { handoffRoleLabel } from "@/lib/handoff/handoffWorkflow";
import type { LineageArtifactStepId } from "@/lib/lineage/artifactChain";

export interface TeamOwnershipRow {
  artifactName: string;
  stepId: LineageArtifactStepId;
  ownerRole: HandoffRoleId;
  ownerRoleLabel: string;
}

const stepOwnerRole: Record<LineageArtifactStepId, HandoffRoleId> = {
  idea: "ceo",
  product_brief: "product_planner",
  mission_plan: "director",
  technical_specification: "architect",
  design_specification: "designer",
  implementation_plan: "developer",
  test_plan: "qa_reviewer",
};

const stepDisplayName: Record<LineageArtifactStepId, string> = {
  idea: "Idea",
  product_brief: "Product Brief",
  mission_plan: "Mission Plan",
  technical_specification: "Technical Specification",
  design_specification: "Design Specification",
  implementation_plan: "Implementation Plan",
  test_plan: "Test Plan",
};

export function buildTeamOwnershipRows(): TeamOwnershipRow[] {
  return (Object.keys(stepOwnerRole) as LineageArtifactStepId[]).map((stepId) => ({
    stepId,
    artifactName: stepDisplayName[stepId],
    ownerRole: stepOwnerRole[stepId],
    ownerRoleLabel: handoffRoleLabel(stepOwnerRole[stepId]),
  }));
}

export function ownerRoleForStep(stepId: LineageArtifactStepId): HandoffRoleId {
  return stepOwnerRole[stepId];
}

export function displayNameForStep(stepId: LineageArtifactStepId): string {
  return stepDisplayName[stepId];
}
