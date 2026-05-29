import type { Task } from "@/types/productai";

export type ReviewStateId = "pending_review" | "in_review" | "review_completed" | "review_blocked";

export interface TaskReviewState {
  id: ReviewStateId;
  label: string;
}

export interface ReviewStatusSummary {
  pendingReview: number;
  inReview: number;
  reviewCompleted: number;
  reviewBlocked: number;
  reviewNotesCount: number;
}

export function inferReviewState(task: Task): TaskReviewState {
  if (task.status === "completed") {
    return { id: "review_completed", label: "Review Completed" };
  }
  if (task.status === "in_review") {
    return { id: "in_review", label: "In Review" };
  }
  if (task.status === "blocked") {
    return { id: "review_blocked", label: "Review Blocked" };
  }
  const hasReviewEvent = (task.events ?? []).some(
    (e) => e.type === "moved_to_review" || e.type === "revision_requested"
  );
  if (hasReviewEvent || task.progress >= 80) {
    return { id: "pending_review", label: "Pending Review" };
  }
  return { id: "pending_review", label: "Pending Review" };
}

export function buildReviewStatusSummary(tasks: Task[]): ReviewStatusSummary {
  const states = tasks.map(inferReviewState);
  const reviewNotesCount = tasks.reduce((sum, t) => {
    const notes = (t.events ?? []).filter(
      (e) => e.type === "note" || e.type === "revision_requested"
    ).length;
    return sum + notes;
  }, 0);

  return {
    pendingReview: states.filter((s) => s.id === "pending_review").length,
    inReview: states.filter((s) => s.id === "in_review").length,
    reviewCompleted: states.filter((s) => s.id === "review_completed").length,
    reviewBlocked: states.filter((s) => s.id === "review_blocked").length,
    reviewNotesCount,
  };
}
