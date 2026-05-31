import { buildBeliefConflicts } from "@/lib/discussion/buildBeliefConflicts";
import { buildDecisionJourney } from "@/lib/discussion/buildDecisionJourney";
import type { BriefChangeProposal, DiscussionMessage } from "@/lib/discussion/discussionTypes";
import {
  normalizeDecisionStatus,
} from "@/lib/discussion/decisionCandidateStatus";
import {
  AGENT_VOTE_LABELS,
  DECISION_STATUS_LABELS,
  type BriefChangeCandidate,
  type DecisionItem,
  type MeetingMinutes,
} from "@/lib/discussion/decisionGovernanceTypes";

function formatDecisionEntry(d: DecisionItem): MeetingMinutes["decisionsMade"][0] {
  const result = normalizeDecisionStatus(d);
  const displayResult =
    result === "applied_to_brief" ? "approved" : result;
  return {
    title: d.title,
    plannerVote: d.plannerVote,
    cooVote: d.cooVote,
    ceoVote: displayResult,
    result: displayResult,
    reason:
      result === "approved" || result === "applied_to_brief"
        ? d.plannerRationale || d.rationale
        : d.cooRationale || d.rationale,
    impact: d.impact ?? "Recorded in executive strategy session.",
  };
}

export function generateMeetingMinutes(input: {
  projectName: string;
  messages: DiscussionMessage[];
  decisionItems: DecisionItem[];
  briefChangeCandidates: BriefChangeCandidate[];
  appliedProposals: BriefChangeProposal[];
  openQuestionSignals?: string[];
  briefVersion?: number;
  discussionPersonaMemory?: import("@/lib/discussion/discussionTypes").DiscussionPersonaMemory;
}): MeetingMinutes {
  const ceoTurns = input.messages.filter((m) => m.participant === "ceo").length;
  const topics = input.messages
    .filter((m) => m.participant === "ceo")
    .slice(-8)
    .map((m) => m.message.slice(0, 120));

  const pendingItems = input.decisionItems.filter(
    (d) => normalizeDecisionStatus(d) === "pending"
  );
  const approved = input.decisionItems.filter((d) => {
    const s = normalizeDecisionStatus(d);
    return s === "approved" || s === "applied_to_brief";
  });
  const rejected = input.decisionItems.filter(
    (d) => normalizeDecisionStatus(d) === "rejected"
  );
  const onHold = input.decisionItems.filter(
    (d) => normalizeDecisionStatus(d) === "on_hold"
  );

  const decisionsMade = approved.map(formatDecisionEntry);
  const pendingDecisions = pendingItems.map(
    (d) => `${d.title} — awaiting CEO (採用 / 保留 / 却下)`
  );
  const rejectedIdeas = rejected.map((d) => {
    const e = formatDecisionEntry(d);
    return `${e.title} — Planner: ${AGENT_VOTE_LABELS[e.plannerVote]} · COO: ${AGENT_VOTE_LABELS[e.cooVote]} · CEO: ${DECISION_STATUS_LABELS.rejected} · Result: ${DECISION_STATUS_LABELS.rejected}`;
  });

  const openQuestions = [
    ...pendingItems.map((d) => `[Pending] ${d.title}`),
    ...onHold.map((d) => `[On hold] ${d.title}`),
    ...(input.openQuestionSignals ?? []),
  ];

  const briefChanges = [
    ...input.briefChangeCandidates
      .filter((c) => c.status === "applied")
      .map((c) => c.title),
    ...input.appliedProposals
      .filter((p) => p.status === "applied")
      .map((p) => p.title),
  ];
  if (!briefChanges.length) {
    briefChanges.push("（まだ Brief へ反映された変更はありません）");
  }

  const architectNotes = [
    `"${input.projectName}" — Architect inherits approved Brief and decision rationale.`,
    `Approved: ${approved.length} · Rejected: ${rejected.length} · Pending: ${pendingItems.length} · On hold: ${onHold.length}.`,
    "Votes (Planner / COO / CEO) are preserved in Meeting Minutes for organizational memory.",
  ];

  const decisionJourney = buildDecisionJourney({
    decisionItems: input.decisionItems,
    messages: input.messages,
    appliedProposals: input.appliedProposals,
    briefVersionLabel: input.briefVersion ? `v${input.briefVersion}` : undefined,
  });

  const beliefConflicts = buildBeliefConflicts({
    messages: input.messages,
    decisionItems: input.decisionItems,
    memoryConflicts: input.discussionPersonaMemory?.beliefConflicts,
  });

  return {
    id: `minutes-${Date.now()}`,
    discussionTopics: topics.length ? topics : [`${input.projectName} 経営会議`],
    decisionJourney: decisionJourney.length ? decisionJourney : undefined,
    beliefConflicts: beliefConflicts.length ? beliefConflicts : undefined,
    decisionsMade,
    pendingDecisions,
    rejectedIdeas,
    openQuestions: openQuestions.length
      ? openQuestions
      : ["（保留中の論点はありません）"],
    briefChanges,
    architectNotes,
    generatedAt: new Date().toISOString(),
    turnCount: ceoTurns,
    status: "draft",
  };
}
