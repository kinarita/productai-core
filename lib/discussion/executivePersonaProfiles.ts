import type { AgentVote } from "@/lib/discussion/decisionGovernanceTypes";
import {
  beliefCheckPrompt,
  beliefCommentForVote,
  COO_BELIEF_PROFILE,
  PLANNER_BELIEF_PROFILE,
} from "@/lib/discussion/executiveBeliefs";
import type { DiscussionPersonaMemory } from "@/lib/discussion/discussionTypes";
import { guardCooTemplate, guardPlannerTemplate } from "@/lib/discussion/templatePhraseGuard";

export { PLANNER_BELIEF_PROFILE, COO_BELIEF_PROFILE };

/** @deprecated Phase 29 alias */
export const PLANNER_PERSONA_PROFILE = PLANNER_BELIEF_PROFILE;
/** @deprecated Phase 29 alias */
export const COO_PERSONA_PROFILE = COO_BELIEF_PROFILE;

const COO_LEAK_IN_PLANNER =
  /コストが見合う|MVPには重い|開発工数|運用負荷|収益性|事業責任|失敗を防/i;
const PLANNER_LEAK_IN_COO =
  /ユーザーは喜びそう|PMFに近づく|体験として強い|エンゲージメント|差別化.*ユーザー/i;

const BRIEF_NAG =
  /現[行在]の? Product Brief には含まれていません|Brief には未反映|現 Brief にはなく/i;

export function personaSelfCheckPlanner(
  text: string,
  allowBriefNote = false,
  memory?: DiscussionPersonaMemory
): string {
  let t = guardPlannerTemplate(text, memory).trim();
  if (COO_LEAK_IN_PLANNER.test(t)) {
    t = t
      .replace(/コストが見合う[^。]*。?/g, "")
      .replace(/MVPには重い[^。]*。?/g, "")
      .replace(/開発工数[^。]*。?/g, "")
      .trim();
    if (!t) {
      t =
        "面白いですね。もし実現できれば、ユーザーは入力をほとんど意識しなくなります。私は価値があると思います。";
    }
  }
  if (!allowBriefNote) {
    t = t.replace(BRIEF_NAG, "").replace(/\s{2,}/g, " ").trim();
  }
  return t;
}

export function personaSelfCheckCoo(
  text: string,
  memory?: DiscussionPersonaMemory
): string {
  let t = guardCooTemplate(text, memory).trim();
  if (PLANNER_LEAK_IN_COO.test(t)) {
    t = t
      .replace(/ユーザーは喜びそう[^。]*。?/g, "")
      .replace(/PMFに近づく[^。]*。?/g, "")
      .trim();
    if (!t) {
      t =
        "価値は理解できます。ただ MVP としては重いです。私ならまず小規模実験を提案します。";
    }
  }
  return t;
}

export function personaSelfCheckPrompt(role: "planner" | "coo"): string {
  return beliefCheckPrompt(role);
}

export function normalizePlannerVote(vote: AgentVote): AgentVote {
  if (vote === "reject") return "hold";
  if (vote === "neutral") return "approve";
  return vote;
}

export function normalizeCooVote(vote: AgentVote): AgentVote {
  if (vote === "neutral") return "hold";
  return vote;
}

export function inferStrongExecutiveVotes(
  plannerSummary?: string,
  cooSummary?: string,
  ceoMessage?: string
): { plannerVote: AgentVote; cooVote: AgentVote } {
  const p = plannerSummary ?? "";
  const c = cooSummary ?? "";
  const ceo = ceoMessage ?? "";
  const scopeExpansion =
    /mvp|入れ|追加|グラフ|ocr|音声|voice|機能|scope|含め/i.test(ceo) ||
    /mvp|追加|範囲|scope|重い/i.test(p + c);

  let plannerVote: AgentVote = "approve";
  let cooVote: AgentVote = scopeExpansion ? "hold" : "approve";

  if (/反対|却下|不要|見送|reject/i.test(p)) plannerVote = "hold";
  else if (/賛成|必要|価値|approve|面白い|喜び|pmf|体験|強い|前向/i.test(p)) {
    plannerVote = "approve";
  } else if (/慎重|hold|保留|簡易|段階|様子/i.test(p)) plannerVote = "hold";

  if (/反対|却下|見送|reject|MVPには重|肥大/i.test(c)) cooVote = "reject";
  else if (/賛成|問題なし|align|approve/i.test(c) && !/慎重|hold|重|コスト|工数/i.test(c)) {
    cooVote = "approve";
  } else if (/慎重|hold|保留|コスト|工数|不明|運用|プライバシー|実現性|検証/i.test(c)) {
    cooVote = "hold";
  }

  return {
    plannerVote: normalizePlannerVote(plannerVote),
    cooVote: normalizeCooVote(cooVote),
  };
}

export { beliefCommentForVote as executiveCommentForVote };
