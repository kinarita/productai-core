import {
  normalizeDecisionStatus,
} from "@/lib/discussion/decisionCandidateStatus";
import {
  AGENT_VOTE_LABELS,
  DECISION_STATUS_LABELS,
  type AgentVote,
  type DecisionItem,
  type MeetingMinutesDecisionJourneyEntry,
} from "@/lib/discussion/decisionGovernanceTypes";
import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";

function voteLabel(v: AgentVote): string {
  return AGENT_VOTE_LABELS[v];
}

function topicFromDecision(d: DecisionItem, messages: DiscussionMessage[]): string {
  const src = messages.find((m) => m.id === d.sourceDiscussionId);
  if (src?.message) return src.message.slice(0, 80);
  return d.title;
}

export function buildDecisionJourney(input: {
  decisionItems: DecisionItem[];
  messages: DiscussionMessage[];
  appliedProposals: BriefChangeProposal[];
  briefVersionLabel?: string;
}): MeetingMinutesDecisionJourneyEntry[] {
  const journeys: MeetingMinutesDecisionJourneyEntry[] = [];

  for (const d of input.decisionItems) {
    const status = normalizeDecisionStatus(d);
    const topic = topicFromDecision(d, input.messages);
    let result = "Pending CEO decision";
    let decisionLine = "Pending";

    if (status === "approved" || status === "applied_to_brief") {
      const applied = input.appliedProposals.find(
        (p) => p.id === d.sourceProposalId || p.title === d.title
      );
      result = applied
        ? `Brief ${input.briefVersionLabel ?? "updated"} — ${applied.title}`
        : `CEO: ${DECISION_STATUS_LABELS.approved}`;
      decisionLine = DECISION_STATUS_LABELS.approved;
    } else if (status === "rejected") {
      result = DECISION_STATUS_LABELS.rejected;
      decisionLine = DECISION_STATUS_LABELS.rejected;
    } else if (status === "on_hold") {
      result = DECISION_STATUS_LABELS.on_hold;
      decisionLine = DECISION_STATUS_LABELS.on_hold;
    }

    const reason =
      status === "on_hold"
        ? d.cooRationale || d.rationale
        : status === "approved" || status === "applied_to_brief"
          ? d.plannerRationale || d.rationale
          : status === "rejected"
            ? d.cooRationale || d.rationale
            : d.cooRationale || d.plannerRationale || d.rationale;

    const ceoLine =
      status === "pending"
        ? "Pending"
        : DECISION_STATUS_LABELS[status] ?? status;

    const plannerComment = d.plannerRationale?.slice(0, 120) ?? "";
    const cooComment = d.cooRationale?.slice(0, 120) ?? "";

    journeys.push({
      topic,
      discussion: [
        plannerComment ? `Planner: ${plannerComment}` : `Planner: ${voteLabel(d.plannerVote)}`,
        cooComment ? `COO: ${cooComment}` : `COO: ${voteLabel(d.cooVote)}`,
      ].join(" · "),
      planner: voteLabel(d.plannerVote),
      plannerComment,
      coo: voteLabel(d.cooVote),
      cooComment,
      ceo: ceoLine,
      decision: decisionLine,
      reason: reason.slice(0, 280),
      result,
    });
  }

  return journeys;
}
