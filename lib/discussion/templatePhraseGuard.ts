import type { DiscussionPersonaMemory } from "@/lib/discussion/discussionTypes";

const PLANNER_BANNED = [
  "現行ブリーフには含まれていません",
  "現 Brief には",
  "Brief には未反映",
  "ユーザー体験を向上する可能性があります",
];

const COO_BANNED = [
  "コストとリスクがあります",
  "コストとリスクの整理",
  "可能性はあります。ただし",
];

function containsBanned(text: string, phrases: string[]): string | null {
  for (const p of phrases) {
    if (text.includes(p)) return p;
  }
  return null;
}

export function guardPlannerTemplate(
  text: string,
  memory?: DiscussionPersonaMemory
): string {
  let t = text.trim();
  const used = memory?.usedPlannerTemplates ?? [];
  const hit = containsBanned(t, PLANNER_BANNED);
  if (hit && used.includes(hit)) {
    t = t.replace(hit, "").replace(/\s{2,}/g, " ").trim();
    if (!t || t.length < 12) {
      t =
        "面白いですね。もし実現できれば、ユーザーは入力をほとんど意識しなくなります。私は価値があると思います。";
    }
  }
  return t;
}

export function guardCooTemplate(
  text: string,
  memory?: DiscussionPersonaMemory
): string {
  let t = text.trim();
  const used = memory?.usedCooTemplates ?? [];
  const hit = containsBanned(t, COO_BANNED);
  if (hit && used.includes(hit)) {
    t = t.replace(hit, "").replace(/\s{2,}/g, " ").trim();
    if (!t || t.length < 12) {
      t =
        "価値は理解できます。ただ MVP としては重いです。私ならまず小規模実験を提案します。";
    }
  }
  return t;
}

export function recordTemplateUsage(
  memory: DiscussionPersonaMemory | undefined,
  plannerText: string,
  cooText: string
): DiscussionPersonaMemory {
  const base = memory ?? {
    ceoHypotheses: [],
    ceoConcerns: [],
    ceoValues: [],
    unresolvedTopics: [],
    adoptedTopics: [],
    usedPlannerTemplates: [],
    usedCooTemplates: [],
    beliefConflicts: [],
  };
  const usedPlanner = [...(base.usedPlannerTemplates ?? [])];
  const usedCoo = [...(base.usedCooTemplates ?? [])];
  for (const p of PLANNER_BANNED) {
    if (plannerText.includes(p) && !usedPlanner.includes(p)) usedPlanner.push(p);
  }
  for (const p of COO_BANNED) {
    if (cooText.includes(p) && !usedCoo.includes(p)) usedCoo.push(p);
  }
  return {
    ...base,
    usedPlannerTemplates: usedPlanner.slice(-12),
    usedCooTemplates: usedCoo.slice(-12),
  };
}
