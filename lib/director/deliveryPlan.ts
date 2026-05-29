import type { Mission } from "@/types/productai";

export interface DeliveryPhase {
  id: string;
  label: string;
  status: "upcoming" | "active" | "completed";
  note: string;
}

export interface DeliveryMilestone {
  label: string;
  target: string;
  note: string;
}

export interface DeliveryPlanView {
  phases: DeliveryPhase[];
  milestones: DeliveryMilestone[];
  targetReviews: string[];
  releaseGoal: string;
}

const phaseLabels = [
  "Planning",
  "Architecture",
  "Design",
  "Development",
  "QA",
  "Release",
] as const;

function phaseStatus(
  index: number,
  activeIndex: number
): DeliveryPhase["status"] {
  if (index < activeIndex) return "completed";
  if (index === activeIndex) return "active";
  return "upcoming";
}

export function buildDeliveryPlan(mission: Mission): DeliveryPlanView {
  const lifecycleIndex = Math.min(
    phaseLabels.length - 1,
    Math.floor((mission.progress / 100) * phaseLabels.length)
  );

  const phases: DeliveryPhase[] = phaseLabels.map((label, index) => ({
    id: label.toLowerCase(),
    label,
    status: phaseStatus(index, lifecycleIndex),
    note:
      index === lifecycleIndex
        ? `Current emphasis for ${mission.name}.`
        : index < lifecycleIndex
          ? "Phase complete for planning visibility."
          : "Planned—no autonomous scheduling.",
  }));

  return {
    phases,
    milestones: [
      {
        label: "Planning baseline",
        target: mission.createdAt ?? mission.updatedAt,
        note: "Product Brief approved and Mission Plan framed.",
      },
      {
        label: "Architecture review window",
        target: "TBD — human schedule",
        note: "Align with Architect handoff when readiness is confirmed.",
      },
      {
        label: "Release readiness",
        target: mission.releaseReadiness.label,
        note: mission.releaseReadiness.summary,
      },
    ],
    targetReviews: [
      "Architecture Review",
      "Design Review",
      "Development Review",
      "QA Review",
      "Release Review",
    ],
    releaseGoal: `${mission.name}: ${mission.releaseReadiness.label} (${mission.releaseReadiness.score}% readiness score)`,
  };
}
