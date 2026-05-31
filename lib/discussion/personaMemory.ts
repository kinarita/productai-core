import type {
  DiscussionMessage,
  DiscussionPersonaMemory,
} from "@/lib/discussion/discussionTypes";
import {
  normalizeDecisionStatus,
} from "@/lib/discussion/decisionCandidateStatus";
import type { DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";
import { classifyDiscussionIntent } from "@/lib/discussion/discussionIntent";
import { extractTopicLabel } from "@/lib/discussion/discussionTopic";
import { isCeoDecisionDirective } from "@/lib/discussion/decisionDirective";

const MAX_ITEMS = 8;

export type { DiscussionPersonaMemory };

export const EMPTY_PERSONA_MEMORY: DiscussionPersonaMemory = {
  ceoHypotheses: [],
  ceoConcerns: [],
  ceoValues: [],
  unresolvedTopics: [],
  adoptedTopics: [],
};

function pushUnique(list: string[], item: string, max = MAX_ITEMS): string[] {
  const trimmed = item.trim().slice(0, 120);
  if (!trimmed) return list;
  const next = [trimmed, ...list.filter((x) => x !== trimmed)];
  return next.slice(0, max);
}

export function updatePersonaMemory(
  prior: DiscussionPersonaMemory | undefined,
  ceoMessage: string,
  decisionItems?: DecisionItem[]
): DiscussionPersonaMemory {
  const memory = prior ?? { ...EMPTY_PERSONA_MEMORY };
  const intent = classifyDiscussionIntent(ceoMessage);
  const topic = extractTopicLabel(ceoMessage);

  let next = { ...memory };

  if (
    topic &&
    (intent === "brainstorm" || intent === "proposal" || isCeoDecisionDirective(ceoMessage))
  ) {
    next = {
      ...next,
      ceoHypotheses: pushUnique(next.ceoHypotheses, topic),
      unresolvedTopics: pushUnique(next.unresolvedTopics, topic),
    };
  }

  if (intent === "challenge" || /懸念|心配|リスク|不安/i.test(ceoMessage)) {
    const concern = topic ?? ceoMessage.slice(0, 80);
    next = {
      ...next,
      ceoConcerns: pushUnique(next.ceoConcerns, concern),
      unresolvedTopics: pushUnique(next.unresolvedTopics, concern),
    };
  }

  if (/ユーザー|価値|体験|pmf|継続/i.test(ceoMessage)) {
    next = {
      ...next,
      ceoValues: pushUnique(next.ceoValues, ceoMessage.slice(0, 100)),
    };
  }

  for (const d of decisionItems ?? []) {
    const status = normalizeDecisionStatus(d);
    if (status === "approved" || status === "applied_to_brief") {
      next = {
        ...next,
        adoptedTopics: pushUnique(next.adoptedTopics, d.title),
        unresolvedTopics: next.unresolvedTopics.filter((t) => t !== d.title),
      };
    }
  }

  return next;
}

export function formatPersonaMemoryBlock(memory: DiscussionPersonaMemory | undefined): string {
  if (!memory) return "(No persona memory yet.)";
  const sections: string[] = [];
  if (memory.ceoHypotheses.length) {
    sections.push(`CEO hypotheses (not yet in Brief unless approved):\n- ${memory.ceoHypotheses.join("\n- ")}`);
  }
  if (memory.ceoConcerns.length) {
    sections.push(`CEO concerns:\n- ${memory.ceoConcerns.join("\n- ")}`);
  }
  if (memory.ceoValues.length) {
    sections.push(`CEO values / priorities:\n- ${memory.ceoValues.join("\n- ")}`);
  }
  if (memory.unresolvedTopics.length) {
    sections.push(`Unresolved topics:\n- ${memory.unresolvedTopics.join("\n- ")}`);
  }
  if (memory.adoptedTopics.length) {
    sections.push(`Adopted topics:\n- ${memory.adoptedTopics.join("\n- ")}`);
  }
  return sections.length ? sections.join("\n\n") : "(Persona memory empty — build from conversation.)";
}

/** Match prior CEO topic for "先ほどの〜" continuity. */
export function recallHypothesisForMessage(
  memory: DiscussionPersonaMemory | undefined,
  ceoMessage: string
): string | null {
  if (!memory?.ceoHypotheses.length) return null;
  if (!/先ほど|さっき|あの|前の/i.test(ceoMessage)) return null;
  for (const h of memory.ceoHypotheses) {
    const key = h.slice(0, 6);
    if (key && ceoMessage.includes(key.slice(0, 4))) return h;
  }
  return memory.ceoHypotheses[0] ?? null;
}

export function seedMemoryFromMessages(
  messages: DiscussionMessage[],
  decisionItems?: DecisionItem[]
): DiscussionPersonaMemory {
  let memory = { ...EMPTY_PERSONA_MEMORY };
  for (const m of messages) {
    if (m.participant === "ceo") {
      memory = updatePersonaMemory(memory, m.message, decisionItems);
    }
  }
  return memory;
}
