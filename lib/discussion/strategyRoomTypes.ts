import type { BriefVersionRecord } from "@/lib/discussion/discussionTypes";
import type {
  DecisionItem,
  MeetingMinutes,
} from "@/lib/discussion/decisionGovernanceTypes";

/** CEO discussion mode (Phase 25). */
export type DiscussionMode = "explore" | "challenge" | "decision";

export type StrategySignalKind =
  | "new_opportunity"
  | "scope_risk"
  | "user_insight"
  | "business_risk";

export type ExecutiveDecisionMark = "agreed" | "open_question" | "rejected";

export interface StrategySignal {
  id: string;
  kind: StrategySignalKind;
  title: string;
  description: string;
  sourceMessageId?: string;
  createdAt: string;
}

export interface ExecutiveDecisionRecord {
  id: string;
  number: number;
  statement: string;
  status: ExecutiveDecisionMark;
  sourceMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategySummary {
  id: string;
  whatWeLearned: string[];
  whatChanged: string[];
  openQuestions: string[];
  recommendedNextStep: string;
  generatedAt: string;
  turnCount: number;
  status: "draft" | "applied_to_brief" | "kept_in_discussion";
}

export interface ArchitectHandoffPreview {
  briefVersion: number;
  briefHeadline: string;
  /** @deprecated Phase 26 — use decisionItems */
  executiveDecisions: ExecutiveDecisionRecord[];
  approvedDecisions: DecisionItem[];
  rejectedDecisions: DecisionItem[];
  openQuestions: string[];
  appliedChanges: string[];
  strategySignals: StrategySignal[];
  /** @deprecated use meetingMinutes */
  strategySummary?: StrategySummary;
  meetingMinutes?: MeetingMinutes;
  /** Phase 26.2 — false while any decision candidate is still pending */
  handoffReady: boolean;
  pendingDecisionCount: number;
  generatedAt: string;
}

export const DISCUSSION_MODE_LABELS: Record<DiscussionMode, string> = {
  explore: "Explore",
  challenge: "Challenge",
  decision: "Decision",
};

export const DISCUSSION_MODE_HINTS: Record<DiscussionMode, string> = {
  explore: "Brainstorm ideas — Planner and COO can be creative.",
  challenge: "Stress-test assumptions — critical perspectives encouraged.",
  decision: "Recommend a direction — converge toward a decision.",
};

export const STRATEGY_SIGNAL_LABELS: Record<StrategySignalKind, string> = {
  new_opportunity: "New Opportunity",
  scope_risk: "Scope Risk",
  user_insight: "User Insight",
  business_risk: "Business Risk",
};

export const EXECUTIVE_DECISION_STATUS_LABELS: Record<ExecutiveDecisionMark, string> = {
  agreed: "Agreed",
  open_question: "Open Question",
  rejected: "Rejected",
};

export function formatBriefVersionHistory(versions?: BriefVersionRecord[]): string {
  if (!versions?.length) return "(No brief version history yet.)";
  return versions
    .map((v) => {
      const changes = v.changeSummary
        ? [...v.changeSummary.added, ...v.changeSummary.modified].join("; ")
        : v.label;
      return `v${v.version} (${v.source}, ${v.createdAt.slice(0, 10)}): ${changes}`;
    })
    .join("\n");
}
