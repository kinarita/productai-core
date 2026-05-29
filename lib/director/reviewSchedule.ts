import type { Mission } from "@/types/productai";
import type { DirectorReviewScheduleState } from "@/lib/director/directorWorkspace";

export interface ReviewScheduleItem {
  id: string;
  label: string;
  state: DirectorReviewScheduleState;
  note: string;
}

const reviewTypes = [
  "Architecture Review",
  "Design Review",
  "Development Review",
  "QA Review",
  "Release Review",
] as const;

function reviewStateForIndex(
  index: number,
  progressIndex: number
): DirectorReviewScheduleState {
  if (index < progressIndex) return "completed";
  if (index === progressIndex) return "scheduled";
  return "planned";
}

export function buildReviewSchedule(mission: Mission): ReviewScheduleItem[] {
  const progressIndex = Math.min(
    reviewTypes.length - 1,
    Math.floor((mission.progress / 100) * reviewTypes.length)
  );

  return reviewTypes.map((label, index) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    state: reviewStateForIndex(index, progressIndex),
    note:
      reviewStateForIndex(index, progressIndex) === "completed"
        ? "Recorded for planning continuity—human-led review."
        : reviewStateForIndex(index, progressIndex) === "scheduled"
          ? "Recommended focus for Director planning cadence."
          : "Planned—no automatic review routing.",
  }));
}
