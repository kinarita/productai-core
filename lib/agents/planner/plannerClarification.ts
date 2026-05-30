import {
  capQuestionsForMode,
  computePmfReadinessFromSignals,
  type PlannerGapAnalysis,
} from "@/lib/pmf/pmfJourney";
import type { DiscoveryMode, ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";
import type { PmfReadiness } from "@/lib/pmf/pmfJourney";

export type PlannerQuestionCategory =
  | "target_users"
  | "platform"
  | "business_model"
  | "scope"
  | "constraints"
  | "success_metrics"
  | "customer_problem"
  | "solution_fit";

export interface PlannerQuestion {
  id: string;
  category: PlannerQuestionCategory;
  question: string;
  reason: string;
  /** Phase 17 — confirmation-style question when Planner inferred an assumption */
  assumption?: string;
}

export interface PlannerClarificationAssessment {
  completenessScore: number;
  needsClarification: boolean;
  missingAreas: string[];
  questions: PlannerQuestion[];
  strengths: string[];
  gaps: string[];
  nextActions: string[];
  opportunities: string[];
  threats: string[];
  painPoints: string[];
  burningNeeds: string[];
  validationAssumptions: string[];
  validationRisks: string[];
  mvpScope: string[];
  pmfReadiness: PmfReadiness;
}

export const MAX_CLARIFICATION_ROUNDS = 3;

const VAGUE_USER_PATTERNS = [
  /^users?$/i,
  /^everyone$/i,
  /^people$/i,
  /^tbd$/i,
  /^なし$/,
  /^未定$/,
];

const VAGUE_GOAL_PATTERNS = [/^success$/i, /^tbd$/i, /^なし$/, /^未定$/];

function isVagueText(text: string, patterns: RegExp[]): boolean {
  const t = text.trim();
  if (t.length < 6) return true;
  return patterns.some((p) => p.test(t));
}

function questionId(category: string, index: number): string {
  return `q-${category}-${index}`;
}

function inferAssumptions(idea: string, targetUsers: string): string[] {
  const assumptions: string[] = [];
  if (/家計|expense|budget|ledger|支出/i.test(idea)) {
    assumptions.push("Product category: household / shared expense tracking");
    assumptions.push("Likely alternatives: MoneyForward, Zaim, or spreadsheet habits");
    assumptions.push("Potential problem: making who-paid-what visible for families");
  }
  if (/家族|family|parent|household/i.test(targetUsers)) {
    assumptions.push("Primary audience: families or household members");
  }
  if (/student|学生/i.test(targetUsers)) {
    assumptions.push("Primary audience: students with limited budget visibility");
  }
  return assumptions;
}

function buildGapAnalysis(input: {
  missingAreas: string[];
  assumptions: string[];
  idea: string;
}): PlannerGapAnalysis {
  const strengths: string[] = [];
  const gaps: string[] = [];
  const nextActions: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];
  const painPoints: string[] = [];
  const burningNeeds: string[] = [];
  const validationAssumptions: string[] = [];
  const validationRisks: string[] = [];
  const mvpScope: string[] = [];

  if (input.assumptions.length > 0) {
    strengths.push("Clear category intent — expense or household money management");
  }
  if (/家族|family|team|共有/i.test(input.idea + input.assumptions.join(" "))) {
    strengths.push("Shared-use scenario is identifiable (multi-person context)");
  }
  if (/家計|expense|budget|ledger|支出/i.test(input.idea)) {
    opportunities.push(
      "Household finance apps are mature — a focused wedge (shared visibility, faster capture) can still win a segment"
    );
    opportunities.push("Users already budget digitally — habit transfer is possible without educating from zero");
    threats.push("Incumbents (MoneyForward, Zaim) have brand trust and bank integrations");
    threats.push("Spreadsheet habits are free and flexible — switching cost is behavioral, not monetary");
    painPoints.push("Shared expense tracking is tedious — who paid what is unclear");
    painPoints.push("One person carries the mental load of household budgeting");
    burningNeeds.push("Families with dual income often need same-day visibility on shared spend");
    burningNeeds.push("Pain spikes at month-end reconciliation — high urgency window");
    validationAssumptions.push("Shared ledger reduces month-end reconciliation time");
    validationRisks.push("Manual entry friction may prevent whole-household adoption");
    mvpScope.push("Must: expense capture + shared view; Won't: bank sync in v1");
  }
  if (input.missingAreas.includes("Platform")) {
    gaps.push("Competitive alternatives and platform choice are not confirmed");
    nextActions.push("Confirm whether v1 is mobile, web, or both");
  }
  if (input.missingAreas.includes("Target Users")) {
    gaps.push("Customer segment is not validated with real interviews");
    nextActions.push("Interview three potential users about current workarounds");
  }
  if (input.missingAreas.includes("MVP Scope")) {
    gaps.push("MVP boundary between solo vs shared workflows is unclear");
    nextActions.push("Decide if family sharing is required in v1 or a fast-follow");
  }
  if (input.missingAreas.includes("Business Model")) {
    gaps.push("Monetization assumptions are untested");
    nextActions.push("Pick a default model (free MVP vs paid) and note validation plan");
  }
  if (input.missingAreas.includes("Success Criteria")) {
    gaps.push("Success metrics are not measurable yet");
    nextActions.push("Define one numeric outcome for the first 90 days");
  }
  if (gaps.length === 0) {
    strengths.push("Enough context to draft a focused PMF hypothesis");
    nextActions.push("Complete Opportunity Discovery, then review Product Brief assumptions");
  }
  if (opportunities.length === 0) {
    opportunities.push("Validate whether a narrower segment has an underserved daily workflow");
  }
  if (threats.length === 0) {
    threats.push("Assumption risk — incumbents and manual workarounds may be good enough for this segment");
  }
  if (painPoints.length === 0) {
    painPoints.push("Top customer pain not yet validated — interview before build");
  }
  if (burningNeeds.length === 0) {
    burningNeeds.push("Burning need unknown — confirm willingness to pay or switch");
  }
  if (validationAssumptions.length === 0) {
    validationAssumptions.push("Solution will be adopted if it is simpler than current workaround");
  }
  if (validationRisks.length === 0) {
    validationRisks.push("Incumbent or manual process may be good enough");
  }
  if (mvpScope.length === 0) {
    mvpScope.push("MVP scope not yet prioritized — run PSF analysis");
  }

  return {
    strengths,
    gaps,
    nextActions,
    opportunities,
    threats,
    painPoints,
    burningNeeds,
    validationAssumptions,
    validationRisks,
    mvpScope,
  };
}

/** Rule-based assessment — assumptions first, minimum questions (Phase 17). */
export function buildHeuristicClarificationAssessment(input: {
  input: ProjectCreationInput;
  clarificationRound: number;
  clarificationNotes?: string;
  questionsAskedSoFar?: number;
}): PlannerClarificationAssessment {
  const mode = input.input.discoveryMode ?? "quick";
  const askedSoFar = input.questionsAskedSoFar ?? 0;

  if (input.clarificationRound >= MAX_CLARIFICATION_ROUNDS) {
    const pmfReadiness = computePmfReadinessFromSignals({
      completenessScore: 82,
      missingAreas: [],
      strengths: ["Maximum clarification rounds reached — proceeding with stated assumptions"],
      gaps: [],
      hasBrief: false,
      discoveryMode: mode,
    });
    return {
      completenessScore: 82,
      needsClarification: false,
      missingAreas: [],
      questions: [],
      strengths: ["Ready to synthesize Opportunity Brief and Product Brief with accumulated answers"],
      gaps: [],
      nextActions: ["Review opportunity hypothesis, then validate top assumptions with users"],
      opportunities: ["Proceed to structured opportunity discovery before scoping MVP"],
      threats: ["Over-building before alternatives and pain are confirmed"],
      painPoints: ["Validate ranked pain points after CPF analysis"],
      burningNeeds: ["Score burning need from interviews, not assumptions alone"],
      validationAssumptions: ["Document solution assumptions before PSF"],
      validationRisks: ["List why the solution might fail"],
      mvpScope: ["Prioritize Must vs Won't before build"],
      pmfReadiness,
    };
  }

  const enriched = `${input.input.idea}\n${input.input.targetUsers}\n${input.input.successGoal}\n${input.clarificationNotes ?? ""}`;
  const assumptions = inferAssumptions(input.input.idea, input.input.targetUsers);
  const missingAreas: string[] = [];
  const questions: PlannerQuestion[] = [];

  const ideaShort = input.input.idea.trim().length < 24;
  const usersVague = isVagueText(input.input.targetUsers, VAGUE_USER_PATTERNS);
  const goalVague = isVagueText(input.input.successGoal, VAGUE_GOAL_PATTERNS);
  const noPlatform = !/iphone|ios|android|web|mobile|chrome|desktop|saas|api/i.test(enriched);
  const isExpenseApp = /家計|expense|budget|ledger|支出/i.test(input.input.idea);
  const hasFamilySignal = /家族|family|共有/i.test(enriched);

  if (isExpenseApp && mode === "guided" && !/誰が|困って|不満|払って/i.test(enriched)) {
    missingAreas.push("Customer Problem Fit");
    questions.push({
      id: questionId("customer_problem", questions.length),
      category: "customer_problem",
      question: "誰が最も困っていますか？（例: 共働き夫婦、家計担当の一方）",
      reason: "CPF requires a specific persona, not a generic label like 'families'.",
      assumption: "Dual-income household with one person managing shared expenses",
    });
    questions.push({
      id: questionId("customer_problem", questions.length),
      category: "customer_problem",
      question: "今はどうやって支出や家計を管理していますか？",
      reason: "Current alternatives reveal switching cost and pain intensity.",
    });
    questions.push({
      id: questionId("customer_problem", questions.length),
      category: "customer_problem",
      question: "その方法の何がいちばん不満ですか？",
      reason: "Weakness of alternatives anchors differentiation.",
    });
    questions.push({
      id: questionId("customer_problem", questions.length),
      category: "customer_problem",
      question: "お金を払ってでも解決したい問題ですか？",
      reason: "Burning need separates 'nice to have' from critical pain.",
    });
  }

  if (isExpenseApp && mode === "guided" && !/なぜこの機能|最低限|最初のユーザー/i.test(enriched)) {
    missingAreas.push("Problem Solution Fit");
    questions.push({
      id: questionId("solution_fit", questions.length),
      category: "solution_fit",
      question: "なぜこの機能（共有・入力など）が必要ですか？",
      reason: "PSF ties every feature to a validated customer problem.",
      assumption: "Shared expense visibility is the core value",
    });
    questions.push({
      id: questionId("solution_fit", questions.length),
      category: "solution_fit",
      question: "既存の家計アプリやスプレッドシートでは解決できませんか？",
      reason: "Confirms differentiation vs alternatives.",
    });
    questions.push({
      id: questionId("solution_fit", questions.length),
      category: "solution_fit",
      question: "最初のバージョンに最低限必要な機能は何ですか？",
      reason: "Drives Must Have vs Won't Have in MVP scope.",
    });
    questions.push({
      id: questionId("solution_fit", questions.length),
      category: "solution_fit",
      question: "最初に使ってほしいユーザーは誰ですか？",
      reason: "First adopters shape validation plan and MVP.",
      assumption: "Household member who currently manages the spreadsheet",
    });
  }

  if (isExpenseApp && mode === "guided" && !/excel|スプレッド|moneyforward|zaim|マネーフォワード|代替/i.test(enriched)) {
    missingAreas.push("Current alternatives");
    questions.push({
      id: questionId("scope", questions.length),
      category: "scope",
      question: "現在はどのような方法で家計や支出を管理していますか？",
      reason: "Understanding alternatives anchors differentiation and opportunity sizing.",
      assumption: "Likely mix of spreadsheets and incumbent finance apps",
    });
  }

  if (usersVague) {
    missingAreas.push("Target Users");
    if (isExpenseApp) {
      questions.push({
        id: questionId("target_users", questions.length),
        category: "target_users",
        assumption: "Primary audience: families managing shared expenses",
        question:
          "家族向けの家計・支出共有を想定していますが、合っていますか？（違う場合は教えてください）",
        reason: "Confirming audience avoids building the wrong MVP.",
      });
    } else {
      questions.push({
        id: questionId("target_users", questions.length),
        category: "target_users",
        question: "主な利用者は誰ですか？",
        reason: "Target users are not defined clearly enough to scope the MVP.",
      });
    }
  } else if (hasFamilySignal && isExpenseApp && noPlatform && mode === "quick") {
    missingAreas.push("Platform");
    questions.push({
      id: questionId("platform", questions.length),
      category: "platform",
      assumption: "First release: mobile app (iOS or Android)",
      question: "まずはスマホアプリから始める想定で合っていますか？",
      reason: "Platform drives scope; we assume mobile unless you prefer web-first.",
    });
  } else if (noPlatform && mode === "guided") {
    missingAreas.push("Platform");
    questions.push({
      id: questionId("platform", questions.length),
      category: "platform",
      assumption: "Web-first MVP unless you need app store distribution",
      question: "Web / iOS / Android のどれを最初のリリースにしますか？",
      reason: "Platform choice drives architecture and delivery constraints.",
    });
  }

  if (
    isExpenseApp &&
    hasFamilySignal &&
    !/共有|share|split/i.test(enriched) &&
    mode === "guided"
  ) {
    missingAreas.push("MVP Scope");
    questions.push({
      id: questionId("scope", questions.length),
      category: "scope",
      assumption: "v1 includes shared expense visibility for household members",
      question: "家族での支出共有は最初のバージョンに必須ですか？",
      reason: "Shared vs solo workflows significantly change MVP scope.",
    });
  }

  if (goalVague && mode === "guided") {
    missingAreas.push("Success Criteria");
    questions.push({
      id: questionId("success_metrics", questions.length),
      category: "success_metrics",
      question: "3か月後に「成功」と言える具体的な状態は何ですか？",
      reason: "Measurable outcomes are required before a confident Product Brief.",
    });
  }

  if (ideaShort && questions.length === 0 && mode === "guided") {
    missingAreas.push("Product vision");
    questions.push({
      id: questionId("scope", questions.length),
      category: "scope",
      question: "解決したい一番の困りごとは何ですか？",
      reason: "The problem statement needs sharpening before planning.",
    });
  }

  const maxQ = capQuestionsForMode(questions, mode, input.clarificationRound, askedSoFar);
  const capped = questions.slice(0, maxQ);

  const gapAnalysis = buildGapAnalysis({
    missingAreas,
    assumptions,
    idea: input.input.idea,
  });

  const completenessScore = Math.max(
    0,
    Math.min(
      100,
      100 -
        missingAreas.length * (mode === "quick" ? 12 : 15) -
        (ideaShort ? 8 : 0) +
        assumptions.length * 4 +
        (hasFamilySignal && !usersVague ? 10 : 0)
    )
  );

  const pmfReadiness = computePmfReadinessFromSignals({
    completenessScore,
    missingAreas,
    strengths: gapAnalysis.strengths,
    gaps: gapAnalysis.gaps,
    hasBrief: false,
    discoveryMode: mode,
  });

  const needsClarification =
    capped.length > 0 &&
    completenessScore < (mode === "quick" ? 78 : 72) &&
    askedSoFar < (mode === "quick" ? 3 : 30);

  return {
    completenessScore,
    needsClarification,
    missingAreas,
    questions: capped,
    strengths: gapAnalysis.strengths,
    gaps: gapAnalysis.gaps,
    nextActions: gapAnalysis.nextActions,
    opportunities: gapAnalysis.opportunities,
    threats: gapAnalysis.threats,
    painPoints: gapAnalysis.painPoints,
    burningNeeds: gapAnalysis.burningNeeds,
    validationAssumptions: gapAnalysis.validationAssumptions,
    validationRisks: gapAnalysis.validationRisks,
    mvpScope: gapAnalysis.mvpScope,
    pmfReadiness,
  };
}

export function formatClarificationNotes(
  rounds: Array<{ round: number; answers: Record<string, string> }>
): string {
  return rounds
    .flatMap((r) =>
      Object.entries(r.answers).map(([qid, answer]) => `Round ${r.round} [${qid}]: ${answer}`)
    )
    .join("\n");
}

export function countQuestionsAsked(history: Array<{ questions: PlannerQuestion[] }>): number {
  return history.reduce((sum, h) => sum + h.questions.length, 0);
}

export function countQuestionsAskedForRun(run: {
  plannerMeta?: {
    clarificationHistory?: Array<{ questions: PlannerQuestion[] }>;
    pendingQuestions?: PlannerQuestion[];
  };
}): number {
  const history = run.plannerMeta?.clarificationHistory ?? [];
  const pending = run.plannerMeta?.pendingQuestions?.length ?? 0;
  return countQuestionsAsked(history) + pending;
}

export function mergeClarificationIntoInput(
  base: ProjectCreationInput,
  clarificationNotes: string
): ProjectCreationInput {
  return {
    ...base,
    clarifications: clarificationNotes.trim() || base.clarifications,
  };
}
