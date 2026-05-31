import type { DiscussionContext } from "@/lib/discussion/buildDiscussionContext";
import {
  buildDiscussionContext,
  inferRelatedSectionFromMessage,
  type DiscussionContextInput,
} from "@/lib/discussion/buildDiscussionContext";
import type {
  BriefChangeProposal,
  DiscussionRelatedSection,
  DiscussionTargetAudience,
} from "@/lib/discussion/discussionTypes";
import {
  audienceIncludesCoo,
  audienceIncludesPlanner,
  resolveDiscussionAudience,
} from "@/lib/discussion/resolveDiscussionAudience";
import { classifyDiscussionIntent } from "@/lib/discussion/discussionIntent";
import {
  agentsSuggestEscalation,
  ceoTopicAbsentFromBrief,
  shouldShowDiscussionDecisionSignal,
} from "@/lib/discussion/decisionCandidateDiscipline";
import {
  recallHypothesisForMessage,
} from "@/lib/discussion/personaMemory";
import { resolveDecisionCandidateTitle } from "@/lib/discussion/discussionTopic";
import { isCeoBrainstormPhrase } from "@/lib/discussion/decisionDirective";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";

function proposalId(): string {
  return `prop-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function continuesPriorThread(message: string, ctx: DiscussionContext): boolean {
  return (
    /先ほど|さっき|じゃあ|それなら|トップ|画面|続けて/i.test(message) &&
    ctx.priorTopics.length > 0
  );
}

function detectFocus(message: string): string {
  if (/グラフ|chart|graph|可視化/i.test(message)) return "charts";
  if (/ターゲット|audience|ユーザー.*広|ペルソナ/i.test(message)) return "audience";
  if (/競合|competitor|zaim|moneyforward/i.test(message)) return "competitors";
  if (/モバイル|mobile|web|アプリ.*先/i.test(message)) return "platform";
  if (/mvp|スコープ|機能/i.test(message)) return "mvp";
  if (/リスク|失敗/i.test(message)) return "risk";
  return "general";
}

export function runDiscussionHeuristic(
  input: DiscussionContextInput & {
    userMessage: string;
    discussionMode?: DiscussionMode;
    targetAudience?: DiscussionTargetAudience;
  }
): {
  targetAudience: DiscussionTargetAudience;
  plannerResponse: string;
  plannerSummary: string;
  plannerDetail: string;
  cooResponse: string;
  cooSummary: string;
  cooDetail: string;
  suggestedChanges: BriefChangeProposal[];
  relatedSection: DiscussionRelatedSection;
  plannerChallenged?: boolean;
  cooRaisedConcern?: boolean;
  plannerSuggestsDecision?: boolean;
  cooSuggestsDecision?: boolean;
  discussionSignal?: boolean;
} {
  const audience = resolveDiscussionAudience({
    targetAudience: input.targetAudience,
    userMessage: input.userMessage,
  });
  const wantPlanner = audienceIncludesPlanner(audience);
  const wantCoo = audienceIncludesCoo(audience);
  const ctx = buildDiscussionContext(input);
  const intent = classifyDiscussionIntent(input.userMessage);
  const ceoMsg = input.userMessage.trim();
  const name = ctx.projectName;
  const brief = input.brief;
  const relatedSection = inferRelatedSectionFromMessage(ceoMsg);
  const briefCorpus = brief ? JSON.stringify(brief) : "";
  const recalled = recallHypothesisForMessage(input.discussionPersonaMemory, ceoMsg);

  if (intent === "greeting") {
    const plannerSummary = `おはようございます。元気ですよ。今日は「${name}」の整理をしていました。`;
    const cooSummary = wantCoo
      ? `おはようございます。こちらも順調です。昨日の議論を見直していました。`
      : "";
    return {
      targetAudience: audience,
      plannerResponse: plannerSummary,
      plannerSummary,
      plannerDetail: "",
      cooResponse: cooSummary,
      cooSummary,
      cooDetail: "",
      suggestedChanges: [],
      relatedSection,
    };
  }

  if (intent === "clarification") {
    const term = /グラフ|chart/i.test(ceoMsg)
      ? "支出や価格を時系列・横並びで見える化する機能です。"
      : /価格比較/i.test(ceoMsg)
        ? "複数店舗の価格を横並びで比較できる機能です。"
        : "ご質問の用語は、ユーザーが判断しやすくするための表示・比較の仕組みです。";
    return {
      targetAudience: audience,
      plannerResponse: term,
      plannerSummary: term,
      plannerDetail: "",
      cooResponse: "",
      cooSummary: "",
      cooDetail: "",
      suggestedChanges: [],
      relatedSection,
    };
  }

  if (intent === "decision") {
    const candidateTitle = resolveDecisionCandidateTitle(ceoMsg, {
      personaMemory: input.discussionPersonaMemory,
      messages: input.discussionMessages,
    });
    const plannerSummary =
      "承知しました。CEO のご意向どおり、Product Brief / MVP への反映を前提に整理します。";
    const cooSummary = wantCoo
      ? "判断事項として記録します。技術コスト・プライバシー・実現性の検証は Hold 推奨です。"
      : "";
    return {
      targetAudience: audience,
      plannerResponse: plannerSummary,
      plannerSummary,
      plannerDetail: `候補: ${candidateTitle}`,
      cooResponse: cooSummary,
      cooSummary,
      cooDetail: wantCoo
        ? "運用・法務・インフラコストの見積もりが必要です。"
        : "",
      suggestedChanges: [],
      relatedSection,
      discussionSignal: false,
      plannerSuggestsDecision: true,
      cooSuggestsDecision: true,
    };
  }

  const absentTopic = ceoTopicAbsentFromBrief(ceoMsg, briefCorpus);
  if (
    intent === "brainstorm" &&
    isCeoBrainstormPhrase(ceoMsg) &&
    /ライブ|カメラ|pos/i.test(ceoMsg)
  ) {
    const topic = absentTopic ?? ( /ライブ/i.test(ceoMsg) ? "ライブカメラ機能" : "POS連携");
    const plannerSummary = absentTopic
      ? `面白いですね。${topic}は現 Brief にはなく仮説段階ですが、ユーザー体験は向上しそうです。`
      : `面白いですね。ユーザー体験・データ鮮度の観点ではアイデアとして魅力的です。`;
    const cooSummary = wantCoo
      ? `可能性はあります。ただし${topic}の運用コストと実装負荷は気になります。`
      : "";
    return {
      targetAudience: audience,
      plannerResponse: plannerSummary,
      plannerSummary,
      plannerDetail: "",
      cooResponse: cooSummary,
      cooSummary,
      cooDetail: "",
      suggestedChanges: [],
      relatedSection: "brief",
      discussionSignal: shouldShowDiscussionDecisionSignal(ceoMsg),
    };
  }

  if (recalled) {
    const plannerSummary = `先ほどの「${recalled}」ですが、まだ仮説段階だと思っています。Brief には未反映です。`;
    const cooSummary = wantCoo
      ? `その通りです。${recalled}は採用前にコストと運用体制の整理が必要です。`
      : "";
    return {
      targetAudience: audience,
      plannerResponse: plannerSummary,
      plannerSummary,
      plannerDetail: "",
      cooResponse: cooSummary,
      cooSummary,
      cooDetail: "",
      suggestedChanges: [],
      relatedSection,
      discussionSignal: true,
    };
  }

  if (/面白い|いいね|いいかも/i.test(ceoMsg) && intent === "brainstorm") {
    const plannerSummary = `ありがとうございます。ユーザー価値の観点では前向きに捉えています。`;
    const cooSummary = wantCoo
      ? `アイデア自体は理解しました。投資対効果が見えるまで様子見がよいと思います。`
      : "";
    return {
      targetAudience: audience,
      plannerResponse: plannerSummary,
      plannerSummary,
      plannerDetail: "",
      cooResponse: cooSummary,
      cooSummary,
      cooDetail: "",
      suggestedChanges: [],
      relatedSection,
      discussionSignal: true,
    };
  }

  if (/mvp.*グラフ|グラフ.*mvp/i.test(ceoMsg)) {
    const mustHave = (input.psfMvpScope ?? input.psfReport?.mvpFeatures.mustHave ?? []).join("、");
    const plannerSummary =
      "私は MVP に月次グラフを入れることに賛成です。入力が続いたユーザーへの報酬になります。";
    const cooSummary = wantCoo
      ? "判断が必要です。MVP 範囲に影響するため、グラフの Must Have 化には慎重です。"
      : "";
    const now = new Date().toISOString();
    const suggestedChanges: BriefChangeProposal[] = wantPlanner
      ? [
          {
            id: proposalId(),
            title: "Add monthly chart to MVP scope",
            description: "CEO requested graph in MVP; agents disagree.",
            reason: "CEO: include chart in MVP. Planner supports; COO cautious on scope.",
            impact: "Defines MVP scope for architect handoff.",
            affectedSections: ["mvp", "brief"],
            targetSection: "mvp",
            before: mustHave.slice(0, 400) || "Current MVP list",
            after: `${mustHave}\n[Must Have] Monthly spending chart`,
            confidence: 82,
            status: "pending",
            proposedAt: now,
          },
        ]
      : [];
    const escalation = agentsSuggestEscalation(plannerSummary, cooSummary);
    return {
      targetAudience: audience,
      plannerResponse: plannerSummary,
      plannerSummary,
      plannerDetail: "### MVP scope",
      cooResponse: cooSummary,
      cooSummary,
      cooDetail: wantCoo ? "### 事業判断" : "",
      suggestedChanges,
      relatedSection: "mvp",
      plannerSuggestsDecision: escalation.planner || true,
      cooSuggestsDecision: escalation.coo || wantCoo,
      discussionSignal: !escalation.both,
    };
  }

  if (intent === "challenge") {
    const plannerSummary =
      "私は必要だと思います。ただし MVP では簡易版で十分かもしれません。";
    const cooSummary = wantCoo
      ? "私は慎重です。理由は初期開発コストと運用負荷です。"
      : "";
    return {
      targetAudience: audience,
      plannerResponse: plannerSummary,
      plannerSummary,
      plannerDetail: "",
      cooResponse: cooSummary,
      cooSummary,
      cooDetail: "",
      suggestedChanges: [],
      relatedSection,
      discussionSignal: shouldShowDiscussionDecisionSignal(ceoMsg),
    };
  }

  const mode = input.discussionMode ?? "explore";
  const focus = detectFocus(ceoMsg);
  const psf = input.psfReport;
  const mvp = input.psfMvpScope ?? psf?.mvpFeatures.mustHave ?? [];
  const thread = continuesPriorThread(ceoMsg, ctx);

  let plannerSummary = `「${name}」について、Brief の次の一手は「${brief?.recommendedNextStep?.slice(0, 60) ?? "検証"}」が中心だと思います。`;
  let plannerDetail = "";
  let cooSummary = wantCoo
    ? `実行面では ${input.cooReview?.recommendation ?? "段階的リリース"} が現実的です。`
    : "";
  let cooDetail = "";

  if (focus === "charts") {
    plannerSummary = thread
      ? "先ほどのグラフの話なら、まずサマリー表示で十分だと思います。"
      : "グラフは Should Have に回し、入力習慣を Must Have に集中したいです。";
    cooSummary = wantCoo
      ? "グラフ競争より獲得・継続 KPI を先に置きたいです。開発コストも抑えられます。"
      : cooSummary;
  }

  const suggestedChanges: BriefChangeProposal[] = [];
  const discussionSignal = shouldShowDiscussionDecisionSignal(ceoMsg);
  const escalation = agentsSuggestEscalation(plannerSummary, cooSummary);

  if (!wantPlanner) {
    plannerSummary = "";
    plannerDetail = "";
  }
  if (!wantCoo) {
    cooSummary = "";
    cooDetail = "";
  }

  return {
    targetAudience: audience,
    plannerResponse: plannerSummary,
    plannerSummary,
    plannerDetail,
    cooResponse: cooSummary,
    cooSummary,
    cooDetail,
    suggestedChanges,
    relatedSection,
    discussionSignal,
    plannerSuggestsDecision: escalation.planner,
    cooSuggestsDecision: escalation.coo,
    cooRaisedConcern: wantCoo && /慎重|コスト|懸念/i.test(cooSummary),
  };
}
