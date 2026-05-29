export type OutcomeStatusId =
  | "not_observed"
  | "observation_started"
  | "early_signals"
  | "validated_outcome"
  | "archived";

export type OutcomeSignalTypeId =
  | "user_feedback"
  | "qa_feedback"
  | "internal_review"
  | "executive_review"
  | "mission_reflection"
  | "release_follow_up";

export type OutcomeWorkspaceViewId =
  | "board"
  | "signals"
  | "timeline"
  | "release_outcome"
  | "summary"
  | "context";

export const outcomeStatusLevels: { id: OutcomeStatusId; title: string }[] = [
  { id: "not_observed", title: "Not Observed" },
  { id: "observation_started", title: "Observation Started" },
  { id: "early_signals", title: "Early Signals" },
  { id: "validated_outcome", title: "Validated Outcome" },
  { id: "archived", title: "Archived" },
];

export const outcomeSignalTypes: { id: OutcomeSignalTypeId; title: string }[] = [
  { id: "user_feedback", title: "User Feedback" },
  { id: "qa_feedback", title: "QA Feedback" },
  { id: "internal_review", title: "Internal Review" },
  { id: "executive_review", title: "Executive Review" },
  { id: "mission_reflection", title: "Mission Reflection" },
  { id: "release_follow_up", title: "Release Follow-up" },
];

export const outcomeWorkspaceAdvisoryNote =
  "The Code & Release workspace provides post-release outcome visibility across mission, task, repository, review, and release—no deploy, analytics execution, or automatic validation.";

export function outcomeStatusLabel(id: OutcomeStatusId): string {
  return outcomeStatusLevels.find((s) => s.id === id)?.title ?? id;
}

export function outcomeSignalLabel(id: OutcomeSignalTypeId): string {
  return outcomeSignalTypes.find((s) => s.id === id)?.title ?? id;
}
