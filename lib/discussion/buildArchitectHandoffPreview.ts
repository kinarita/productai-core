import { formatProductBriefMarkdown } from "@/lib/agents/planner/formatProductBrief";
import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { BriefChangeProposal, DiscussionMessage } from "@/lib/discussion/discussionTypes";
import {
  canFinalizeArchitectHandoff,
  countPendingDecisionCandidates,
  normalizeDecisionStatus,
} from "@/lib/discussion/decisionCandidateStatus";
import type {
  BriefChangeCandidate,
  DecisionItem,
  MeetingMinutes,
} from "@/lib/discussion/decisionGovernanceTypes";
import type {
  ArchitectHandoffPreview,
  StrategySignal,
} from "@/lib/discussion/strategyRoomTypes";

export function buildArchitectHandoffPreview(input: {
  projectName: string;
  brief: ProductBriefSections;
  briefVersion?: number;
  decisionItems: DecisionItem[];
  strategySignals: StrategySignal[];
  meetingMinutes?: MeetingMinutes;
  appliedProposals: BriefChangeProposal[];
  briefChangeCandidates: BriefChangeCandidate[];
  discussionMessages: DiscussionMessage[];
}): ArchitectHandoffPreview {
  const approvedDecisions = input.decisionItems.filter((d) => {
    const s = normalizeDecisionStatus(d);
    return s === "approved" || s === "applied_to_brief";
  });
  const rejectedDecisions = input.decisionItems.filter(
    (d) => normalizeDecisionStatus(d) === "rejected"
  );
  const onHold = input.decisionItems.filter(
    (d) => normalizeDecisionStatus(d) === "on_hold"
  );
  const pendingCount = countPendingDecisionCandidates(input.decisionItems);

  const openQuestions = [
    ...input.decisionItems
      .filter((d) => normalizeDecisionStatus(d) === "pending")
      .map((d) => `[Pending] ${d.title}`),
    ...onHold.map((d) => d.title),
    ...(input.meetingMinutes?.openQuestions ?? []),
  ];
  const mergedOpen = [...new Set(openQuestions)];

  const appliedChanges = [
    ...input.briefChangeCandidates
      .filter((c) => c.status === "applied")
      .map((c) => c.title),
    ...input.appliedProposals
      .filter((p) => p.status === "applied")
      .map((p) => `${p.title} — ${p.reason?.slice(0, 80) ?? p.description.slice(0, 80)}`),
  ];

  const headline = formatProductBriefMarkdown(input.projectName, input.brief)
    .split("\n")
    .slice(0, 8)
    .join("\n");

  return {
    briefVersion: input.briefVersion ?? 1,
    briefHeadline: headline,
    executiveDecisions: [],
    approvedDecisions,
    rejectedDecisions,
    openQuestions: mergedOpen,
    appliedChanges,
    strategySignals: input.strategySignals.slice(-12),
    meetingMinutes: input.meetingMinutes,
    handoffReady: canFinalizeArchitectHandoff(input.decisionItems),
    pendingDecisionCount: pendingCount,
    generatedAt: new Date().toISOString(),
  };
}
