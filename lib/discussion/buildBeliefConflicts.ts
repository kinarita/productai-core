import {
  normalizeDecisionStatus,
} from "@/lib/discussion/decisionCandidateStatus";
import type { DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import type { MeetingMinutesBeliefConflictEntry } from "@/lib/discussion/decisionGovernanceTypes";
import {
  cooBeliefFromReason,
  plannerBeliefFromReason,
} from "@/lib/discussion/executiveDebate";
import type {
  BeliefConflictRecord,
  DiscussionMessage,
} from "@/lib/discussion/discussionTypes";

function ceoDecisionLabel(status: ReturnType<typeof normalizeDecisionStatus>): string {
  if (status === "approved" || status === "applied_to_brief") return "採用";
  if (status === "rejected") return "却下";
  if (status === "on_hold") return "保留";
  return "Pending";
}

export function buildBeliefConflicts(input: {
  messages: DiscussionMessage[];
  decisionItems: DecisionItem[];
  memoryConflicts?: BeliefConflictRecord[];
}): MeetingMinutesBeliefConflictEntry[] {
  const fromMemory: MeetingMinutesBeliefConflictEntry[] = (input.memoryConflicts ?? []).map(
    (c) => ({
      topic: c.topic,
      plannerBelief: c.plannerBelief,
      cooBelief: c.cooBelief,
      ceoDecision: c.ceoDecision,
    })
  );

  const fromMessages: MeetingMinutesBeliefConflictEntry[] = [];
  for (const msg of input.messages) {
    if (!msg.executiveDebate || !msg.debateTopic) continue;
    if (msg.participant !== "coo") continue;
    fromMessages.push({
      topic: msg.debateTopic,
      plannerBelief: plannerBeliefFromReason(msg.debatePlannerReason ?? ""),
      cooBelief: cooBeliefFromReason(msg.debateCooReason ?? ""),
      ceoDecision: undefined,
    });
  }

  for (const d of input.decisionItems) {
    const status = normalizeDecisionStatus(d);
    const topic = d.title.slice(0, 80);
    const entry: MeetingMinutesBeliefConflictEntry = {
      topic,
      plannerBelief: plannerBeliefFromReason(d.plannerRationale ?? ""),
      cooBelief: cooBeliefFromReason(d.cooRationale ?? ""),
      ceoDecision: ceoDecisionLabel(status),
    };
    const dup = fromMessages.some((m) => m.topic === topic);
    if (!dup && d.plannerVote !== d.cooVote) {
      fromMessages.push(entry);
    } else if (dup) {
      const idx = fromMessages.findIndex((m) => m.topic === topic);
      if (idx >= 0) fromMessages[idx] = { ...fromMessages[idx], ...entry };
    }
  }

  const merged: MeetingMinutesBeliefConflictEntry[] = [...fromMemory];
  for (const m of fromMessages) {
    if (!merged.some((x) => x.topic === m.topic)) merged.push(m);
  }
  return merged.slice(-12);
}

export function appendBeliefConflictToMemory(
  memory: BeliefConflictRecord[] | undefined,
  conflict: BeliefConflictRecord
): BeliefConflictRecord[] {
  const next = [...(memory ?? [])];
  if (!next.some((c) => c.topic === conflict.topic)) next.push(conflict);
  return next.slice(-12);
}
