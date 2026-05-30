import type { Mission, OrganizationFeedItem, Task } from "@/types/productai";
import {
  buildCrossReviewBoardRows,
  buildCrossRoleReviewRecords,
} from "@/lib/cross-review/crossRoleReviewAnalysis";
import { handoffRoleLabel } from "@/lib/handoff/handoffWorkflow";
import type { ReviewStateId } from "@/lib/review/reviewStatus";
import { aiWorkerDefinitions } from "@/lib/agent-first/aiWorkers";

export type HumanReviewStatusKind = "approved" | "waiting" | "changes_requested";

export interface HumanReviewCard {
  reviewId: string;
  title: string;
  currentReviewer: string;
  statusKind: HumanReviewStatusKind;
  statusLabel: string;
  statusEmoji: string;
  lastUpdated: string;
  missionName: string;
  missionId: string;
}

const statusPresentation: Record<
  HumanReviewStatusKind,
  { emoji: string; label: string }
> = {
  approved: { emoji: "🟢", label: "Approved" },
  waiting: { emoji: "🟡", label: "Waiting Review" },
  changes_requested: { emoji: "🔴", label: "Changes Requested" },
};

function mapReviewState(state: ReviewStateId): HumanReviewStatusKind {
  if (state === "approved" || state === "archived") return "approved";
  if (state === "changes_requested") return "changes_requested";
  return "waiting";
}

function humanReviewerLabel(roleLabel: string): string {
  const worker = aiWorkerDefinitions.find(
    (w) => handoffRoleLabel(w.handoffRole) === roleLabel || w.title === roleLabel
  );
  if (worker) return `${worker.emoji} ${worker.title}`;
  if (roleLabel === "CEO") return "You";
  if (roleLabel === "Director") return "Mission lead";
  return roleLabel;
}

export function buildHumanReviewCards(input: {
  missions: Mission[];
  tasks: Task[];
  feedItems: OrganizationFeedItem[];
}): HumanReviewCard[] {
  const records = buildCrossRoleReviewRecords(input);
  const rows = buildCrossReviewBoardRows(records, input.missions);

  return rows.map((row) => {
    const statusKind = mapReviewState(row.reviewStateId);
    const presentation = statusPresentation[statusKind];
    return {
      reviewId: row.reviewId,
      title: row.artifact,
      currentReviewer: humanReviewerLabel(row.reviewerRole),
      statusKind,
      statusLabel: presentation.label,
      statusEmoji: presentation.emoji,
      lastUpdated: row.lastUpdated,
      missionName: row.mission,
      missionId: row.missionId,
    };
  });
}
