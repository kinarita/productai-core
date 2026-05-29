import type { Mission } from "@/types/productai";
import type { TechnicalSpecificationRecord } from "@/lib/architect/technicalSpecification";

export interface UxSpecificationView {
  userGoals: string[];
  userTasks: string[];
  successSignals: string[];
  frictionPoints: string[];
  accessibilityNotes: string[];
}

export function buildUxSpecification(input: {
  mission: Mission;
  specification: TechnicalSpecificationRecord;
}): UxSpecificationView {
  return {
    userGoals: [
      "Understand mission planning and design status at a glance.",
      "Navigate CEO → Planner → Director → Architect → Designer continuity.",
      "Authorize decisions—never rely on autonomous approval messaging.",
    ],
    userTasks: [
      `Review ${input.mission.name} technical and design artifacts.`,
      "Confirm open questions before development planning.",
      "Link to Artifact Review for human feedback recording.",
    ],
    successSignals: [
      "Executive-readable summaries on CEO Home.",
      "Design Review status reaches Review Candidate or Ready For Development Planning.",
      "Open UX questions visible and tracked.",
    ],
    frictionPoints: input.specification.openQuestions.length
      ? input.specification.openQuestions.slice(0, 3)
      : ["No friction points recorded—confirm constraints with Architect."],
    accessibilityNotes: [
      "Maintain readable contrast and text sizing per UI implementation guide.",
      "Status labels should not rely on color alone.",
      "Keyboard navigation for workspace view toggles where implemented.",
    ],
  };
}
