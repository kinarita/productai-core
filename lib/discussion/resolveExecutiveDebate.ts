import { extractTopicLabel } from "@/lib/discussion/discussionTopic";
import {
  normalizeDecisionStatus,
  type DecisionCandidateStatus,
} from "@/lib/discussion/decisionCandidateStatus";
import type { DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";

function normalizeTopicKey(text: string): string {
  return text
    .replace(/\s+/g, "")
    .replace(/をMVP(へ|に)追加する(か)?/gi, "")
    .replace(/をProductBrief(に)?追加する/gi, "")
    .replace(/について/g, "")
    .toLowerCase();
}

/** Match debate topic strings to Decision Candidate titles. */
export function debateTopicsMatch(debateTopic: string, decisionTitle: string): boolean {
  const a = normalizeTopicKey(debateTopic);
  const b = normalizeTopicKey(decisionTitle);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const la = extractTopicLabel(debateTopic);
  const lb = extractTopicLabel(decisionTitle);
  if (la && lb && la === lb) return true;
  if (la && decisionTitle.includes(la)) return true;
  if (lb && debateTopic.includes(lb)) return true;

  return false;
}

export function formatDebateResolutionLabel(status: DecisionCandidateStatus): string {
  switch (status) {
    case "approved":
    case "applied_to_brief":
      return "Resolved: Approved by CEO";
    case "rejected":
      return "Resolved: Rejected by CEO";
    case "on_hold":
      return "Resolved: On hold by CEO";
    default:
      return "Resolved";
  }
}

function resolutionFromStatus(
  status: DecisionCandidateStatus
): DecisionCandidateStatus {
  return status === "applied_to_brief" ? "approved" : status;
}

/** Mark matching unresolved debates when CEO decides on a candidate. */
export function resolveDebatesForDecision(
  messages: DiscussionMessage[],
  decision: DecisionItem,
  status: DecisionCandidateStatus
): DiscussionMessage[] {
  const resolution = resolutionFromStatus(status);

  return messages.map((msg) => {
    if (!msg.executiveDebate || !msg.debateTopic || msg.debateResolved) return msg;

    const linked = msg.debateDecisionId === decision.id;
    const topicMatch = debateTopicsMatch(msg.debateTopic, decision.title);
    if (!linked && !topicMatch) return msg;

    return {
      ...msg,
      debateResolved: true,
      debateResolutionStatus: resolution,
      debateDecisionId: decision.id,
    };
  });
}

function findLinkedDecision(
  msg: DiscussionMessage,
  decisions: DecisionItem[]
): DecisionItem | undefined {
  if (!msg.debateDecisionId) return undefined;
  return decisions.find((d) => d.id === msg.debateDecisionId);
}

/**
 * Pending debates are shown prominently; resolved debates collapse to a one-line label.
 * Supports legacy messages without persisted debateResolved flags.
 */
export function getDebateDisplayState(
  msg: DiscussionMessage,
  decisions: DecisionItem[]
): { isPending: boolean; resolvedLabel?: string } {
  if (!msg.executiveDebate || !msg.debateTopic) {
    return { isPending: false };
  }

  if (msg.debateResolved && msg.debateResolutionStatus) {
    return {
      isPending: false,
      resolvedLabel: formatDebateResolutionLabel(msg.debateResolutionStatus),
    };
  }

  const linked = findLinkedDecision(msg, decisions);
  if (linked) {
    const linkedStatus = normalizeDecisionStatus(linked);
    if (linkedStatus === "pending") return { isPending: true };
    return {
      isPending: false,
      resolvedLabel: formatDebateResolutionLabel(linkedStatus),
    };
  }

  const matching = decisions.filter((d) =>
    debateTopicsMatch(msg.debateTopic!, d.title)
  );
  if (!matching.length) return { isPending: true };

  const msgTime = new Date(msg.createdAt).getTime();
  const pendingAfter = matching
    .filter(
      (d) =>
        normalizeDecisionStatus(d) === "pending" &&
        new Date(d.createdAt).getTime() >= msgTime
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const resolvedAfter = matching
    .filter((d) => {
      const s = normalizeDecisionStatus(d);
      return s !== "pending" && new Date(d.updatedAt).getTime() >= msgTime;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const latestPending = pendingAfter[0];
  const latestResolved = resolvedAfter[0];

  if (latestPending) {
    const pendingCreated = new Date(latestPending.createdAt).getTime();
    const resolvedUpdated = latestResolved
      ? new Date(latestResolved.updatedAt).getTime()
      : 0;

    if (pendingCreated > resolvedUpdated && msgTime >= pendingCreated - 10_000) {
      return { isPending: true };
    }
    if (latestResolved) {
      return {
        isPending: false,
        resolvedLabel: formatDebateResolutionLabel(
          normalizeDecisionStatus(latestResolved)
        ),
      };
    }
    return { isPending: true };
  }

  if (latestResolved) {
    return {
      isPending: false,
      resolvedLabel: formatDebateResolutionLabel(
        normalizeDecisionStatus(latestResolved)
      ),
    };
  }

  const anyPending = matching.some(
    (d) => normalizeDecisionStatus(d) === "pending"
  );
  return { isPending: anyPending };
}

/** Attach decision id to debate messages from the same turn (for precise resolution). */
export function linkDebatesToDecision(
  messages: DiscussionMessage[],
  messageIds: string[],
  decisionId: string
): DiscussionMessage[] {
  const idSet = new Set(messageIds);
  return messages.map((msg) => {
    if (!idSet.has(msg.id) || !msg.executiveDebate) return msg;
    return { ...msg, debateDecisionId: decisionId };
  });
}
