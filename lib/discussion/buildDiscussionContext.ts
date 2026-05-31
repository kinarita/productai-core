import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { CooReviewReport } from "@/lib/coo-review/cooReviewTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type {
  BriefChangeProposal,
  BriefVersionRecord,
  DiscussionMessage,
  DiscussionRelatedSection,
} from "@/lib/discussion/discussionTypes";
import {
  formatBriefVersionHistory,
  type DiscussionMode,
} from "@/lib/discussion/strategyRoomTypes";
import type { DecisionItem } from "@/lib/discussion/decisionGovernanceTypes";

export interface DiscussionContextInput {
  missionId: string;
  projectName: string;
  idea: string;
  targetUsers: string;
  successGoal: string;
  missionSummary?: string;
  brief?: ProductBriefSections;
  briefVersion?: number;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  psfMvpScope?: string[];
  cooReview?: CooReviewReport;
  validationRequests?: Array<{ reason: string; requestedAt: string }>;
  discussionMessages?: DiscussionMessage[];
  /** Phase 25 — thread memory */
  discussionMode?: DiscussionMode;
  briefVersions?: BriefVersionRecord[];
  pendingProposals?: BriefChangeProposal[];
  decisionItems?: DecisionItem[];
}

export interface DiscussionContext {
  missionId: string;
  projectName: string;
  contextBlock: string;
  historyBlock: string;
  validationHistoryBlock: string;
  messageCount: number;
  lastCeoMessage?: string;
  priorTopics: string[];
}

const PARTICIPANT_LABEL: Record<DiscussionMessage["participant"], string> = {
  ceo: "CEO",
  planner: "Product Planner",
  coo: "Chief Operating Officer",
};

function formatBrief(brief: ProductBriefSections): string {
  return [
    `Summary: ${brief.projectSummary}`,
    `Problem: ${brief.problemStatement}`,
    `Target users: ${brief.targetUsers}`,
    `Success metrics: ${brief.successMetrics}`,
    `Core features: ${brief.coreFeatures.join("; ")}`,
    `Out of scope: ${brief.outOfScope.join("; ")}`,
    `Risks: ${brief.risks.join("; ")}`,
    `Next step: ${brief.recommendedNextStep}`,
  ].join("\n");
}

function formatOpportunity(ob: OpportunityBrief): string {
  return [
    `Hypothesis: ${ob.opportunityHypothesis}`,
    `Summary: ${ob.opportunitySummary}`,
    `Evidence: ${ob.evidenceLevel}`,
    `Recommended action: ${ob.recommendedAction}`,
    `Confidence: ${ob.plannerConfidence}%`,
    `Customer pain: ${ob.customerPain.join("; ")}`,
    `Alternatives: ${ob.currentAlternatives.join("; ")}`,
  ].join("\n");
}

function formatCpf(cpf: CustomerProblemFitReport): string {
  const topPains = cpf.painPoints
    .slice(0, 4)
    .map((p) => `${p.text} (${p.severity}, priority ${p.priority})`)
    .join("; ");
  return [
    `CPF score: ${cpf.cpfScore}%`,
    `Burning need score: ${cpf.burningNeedScore}%`,
    `Persona: ${cpf.persona.join("; ")}`,
    `Jobs: ${cpf.customerJobs.join("; ")}`,
    `Top pains: ${topPains}`,
    `Alternatives: ${cpf.currentAlternatives.join("; ")}`,
    `Recommendation: ${cpf.recommendation}`,
  ].join("\n");
}

function formatPsf(psf: ProblemSolutionFitReport, mvpScope?: string[]): string {
  const mvp = psf.mvpFeatures;
  return [
    `PSF score: ${psf.psfScore}%`,
    `Top problem: ${psf.topProblem}`,
    `Solution hypothesis: ${psf.solutionHypothesis}`,
    `Expected outcome: ${psf.expectedOutcome}`,
    `Must-have MVP: ${mvp.mustHave.join("; ")}`,
    `Should-have MVP: ${mvp.shouldHave.join("; ")}`,
    `Won't have: ${mvp.wontHave.join("; ")}`,
    mvpScope?.length ? `Planner MVP scope notes: ${mvpScope.join("; ")}` : "",
    `Validation risks: ${psf.validationRisks.join("; ")}`,
    `Recommendation: ${psf.recommendation}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatCooReview(review: CooReviewReport): string {
  return [
    `Overall score: ${review.overallScore}/100`,
    `Recommendation: ${review.recommendation}`,
    `Executive summary: ${review.executiveSummary}`,
    `Strengths: ${review.strengths.join("; ")}`,
    `Concerns: ${review.concerns.join("; ")}`,
    `Required actions: ${review.requiredActions.join("; ")}`,
    `Market: ${review.marketOpportunityAssessment.slice(0, 300)}`,
    `Customer problem: ${review.customerProblemAssessment.slice(0, 300)}`,
    `Solution: ${review.solutionAssessment.slice(0, 300)}`,
  ].join("\n");
}

function buildHistoryBlock(messages: DiscussionMessage[] | undefined): string {
  if (!messages?.length) return "(No prior discussion — this is the opening thread.)";

  return messages
    .map((m) => {
      const who = PARTICIPANT_LABEL[m.participant];
      const section = m.relatedSection ? ` [${m.relatedSection}]` : "";
      return `${who}${section}: ${m.message}`;
    })
    .join("\n\n");
}

function extractPriorTopics(messages: DiscussionMessage[]): string[] {
  const topics: string[] = [];
  const joined = messages.map((m) => m.message).join(" ");
  if (/グラフ|chart|graph|可視化/i.test(joined)) topics.push("charts");
  if (/ターゲット|audience|ユーザー|ペルソナ/i.test(joined)) topics.push("audience");
  if (/競合|competitor|zaim|moneyforward/i.test(joined)) topics.push("competitors");
  if (/モバイル|mobile|web|アプリ/i.test(joined)) topics.push("platform");
  if (/mvp|スコープ|scope/i.test(joined)) topics.push("mvp");
  return topics;
}

export function inferRelatedSectionFromMessage(message: string): DiscussionRelatedSection {
  const m = message.toLowerCase();
  if (/グラフ|chart|graph|可視化|ダッシュボード|トップ画面|ui/i.test(message)) return "mvp";
  if (/競合|competitor|市場|moneyforward|zaim/i.test(message)) return "opportunity";
  if (/ターゲット|audience|ペルソナ|cpf|ユーザー層/i.test(message)) return "cpf";
  if (/モバイル|mobile|web|psf|ソリューション|solution/i.test(message)) return "psf";
  if (/mvp|スコープ|機能|must|should/i.test(message) || /\bmvp\b/.test(m)) return "mvp";
  if (/リスク|risk|失敗/i.test(message)) return "brief";
  return "brief";
}

export function buildDiscussionContext(input: DiscussionContextInput): DiscussionContext {
  const sections: string[] = [
    `# Product: ${input.projectName}`,
    `Mission ID: ${input.missionId}`,
    input.missionSummary ? `Mission summary: ${input.missionSummary}` : "",
    "",
    "## CEO inputs",
    `Idea: ${input.idea}`,
    `Target users: ${input.targetUsers}`,
    `Success goal: ${input.successGoal}`,
  ];

  if (input.brief) {
    sections.push("", `## Product Brief (v${input.briefVersion ?? 1})`, formatBrief(input.brief));
  }
  if (input.opportunityBrief) {
    sections.push("", "## Opportunity Brief", formatOpportunity(input.opportunityBrief));
  }
  if (input.cpfReport) {
    sections.push("", "## Customer Problem Fit", formatCpf(input.cpfReport));
  }
  if (input.psfReport) {
    sections.push("", "## Problem Solution Fit", formatPsf(input.psfReport, input.psfMvpScope));
  }
  if (input.cooReview) {
    sections.push("", "## COO Review (AI recommendation)", formatCooReview(input.cooReview));
  }

  const validationHistoryBlock =
    input.validationRequests?.length ?
      input.validationRequests
        .map((v, i) => `${i + 1}. [${v.requestedAt}] ${v.reason}`)
        .join("\n")
    : "(No prior CEO validation requests.)";

  const historyBlock = buildHistoryBlock(input.discussionMessages);
  const messages = input.discussionMessages ?? [];
  const lastCeo = [...messages].reverse().find((m) => m.participant === "ceo");

  sections.push("", "## Full discussion history", historyBlock);

  if (input.briefVersions?.length) {
    sections.push("", "## Brief version history", formatBriefVersionHistory(input.briefVersions));
  }

  const applied = (input.pendingProposals ?? []).filter((p) => p.status === "applied");
  if (applied.length) {
    sections.push(
      "",
      "## Applied changes from discussion",
      applied.map((p) => `- ${p.title}: ${p.reason ?? p.description}`).join("\n")
    );
  }

  const decisions = input.decisionItems?.length
    ? input.decisionItems
    : [];
  if (decisions.length) {
    sections.push(
      "",
      "## Decision register (governance)",
      decisions
        .map(
          (d) =>
            `${d.title} [CEO: ${d.status ?? d.ceoDecision ?? "pending"}] Planner:${d.plannerVote} COO:${d.cooVote} — ${d.rationale.slice(0, 100)}`
        )
        .join("\n")
    );
  }

  if (input.discussionMode) {
    sections.push("", "## Discussion mode this session", input.discussionMode);
  }

  return {
    missionId: input.missionId,
    projectName: input.projectName,
    contextBlock: sections.filter(Boolean).join("\n"),
    historyBlock,
    validationHistoryBlock,
    messageCount: messages.length,
    lastCeoMessage: lastCeo?.message,
    priorTopics: extractPriorTopics(messages),
  };
}
