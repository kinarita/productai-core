import type { DiscoveryMode } from "@/lib/project-creation/projectCreationTypes";

export type PmfStage =
  | "idea_validation"
  | "opportunity_discovery"
  | "cpf"
  | "psf"
  | "mvp"
  | "pmf";

export interface PmfReadiness {
  ideaValidation: number;
  opportunityDiscovery: number;
  cpf: number;
  psf: number;
  mvp: number;
  pmf: number;
}

export interface PlannerGapAnalysis {
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
}

export const PMF_STAGE_ORDER: PmfStage[] = [
  "idea_validation",
  "opportunity_discovery",
  "cpf",
  "psf",
  "mvp",
  "pmf",
];

/** Human-first labels — no jargon by default (Phase 17–18). */
export const pmfStageHumanLabels: Record<
  PmfStage,
  { title: string; summary: (score: number) => string }
> = {
  idea_validation: {
    title: "Idea",
    summary: (score) =>
      score >= 70
        ? "The idea is articulated enough to explore market opportunity."
        : "Sharpen the core idea before investing in discovery.",
  },
  opportunity_discovery: {
    title: "Opportunity discovery",
    summary: (score) =>
      score >= 65
        ? "Market opportunity, pain, and alternatives are forming a testable hypothesis."
        : "Opportunity is still hypothetical — validate pain and alternatives before building.",
  },
  cpf: {
    title: "Customer problem",
    summary: (score) =>
      score >= 60
        ? "We understand the problem, but we need more confidence customers truly experience it."
        : "The customer problem is still unclear — more discovery recommended.",
  },
  psf: {
    title: "Solution fit",
    summary: (score) =>
      score >= 50
        ? "The solution direction is forming, but key assumptions are untested."
        : "We have not yet validated whether this solution fits the problem.",
  },
  mvp: {
    title: "First version",
    summary: (score) =>
      score >= 40
        ? "An MVP scope is emerging — boundaries need tightening."
        : "MVP scope is not defined enough to build yet.",
  },
  pmf: {
    title: "Product-market fit",
    summary: (score) =>
      score >= 30
        ? "Early signals only — PMF validation comes after launch learning."
        : "PMF is a future milestone; focus on problem and MVP clarity first.",
  },
};

export function defaultPmfReadiness(): PmfReadiness {
  return {
    ideaValidation: 35,
    opportunityDiscovery: 25,
    cpf: 20,
    psf: 10,
    mvp: 0,
    pmf: 0,
  };
}

export function inferCurrentPmfStage(readiness: PmfReadiness): PmfStage {
  if (readiness.opportunityDiscovery < 45) return "opportunity_discovery";
  if (readiness.cpf < 50) return "cpf";
  if (readiness.psf < 50) return "psf";
  if (readiness.mvp < 40) return "mvp";
  if (readiness.pmf < 50) return "pmf";
  return "pmf";
}

export function computePmfReadinessFromSignals(input: {
  completenessScore: number;
  missingAreas: string[];
  strengths: string[];
  gaps: string[];
  hasBrief: boolean;
  hasOpportunityBrief?: boolean;
  hasCpfReport?: boolean;
  hasPsfReport?: boolean;
  discoveryMode: DiscoveryMode;
}): PmfReadiness {
  const base = input.completenessScore;
  const gapPenalty = Math.min(30, input.gaps.length * 6);
  const strengthBonus = Math.min(15, input.strengths.length * 4);
  const opportunityBonus = input.hasOpportunityBrief ? 18 : 0;
  const cpfBonus = input.hasCpfReport ? 15 : 0;
  const psfBonus = input.hasPsfReport ? 14 : 0;

  const ideaValidation = Math.min(
    100,
    Math.max(0, base + strengthBonus - (input.missingAreas.length > 2 ? 10 : 0))
  );
  const opportunityDiscovery = Math.min(
    100,
    Math.max(
      0,
      ideaValidation -
        10 -
        gapPenalty / 2 +
        opportunityBonus +
        (input.strengths.some((s) => /alternative|competitor|market/i.test(s)) ? 8 : 0) +
        (input.discoveryMode === "guided" ? 5 : 0)
    )
  );
  const cpf = Math.min(
    100,
    Math.max(
      0,
      opportunityDiscovery -
        12 -
        gapPenalty +
        cpfBonus +
        (input.strengths.some((s) => /pain|problem/i.test(s)) ? 10 : 0)
    )
  );
  const psf = Math.min(
    100,
    Math.max(0, cpf - 15 - gapPenalty / 3 + psfBonus + (input.discoveryMode === "guided" ? 8 : 0))
  );
  const mvp = input.hasBrief ? Math.min(100, Math.max(25, psf - 5)) : Math.min(40, psf / 2);
  const pmf = input.hasBrief ? Math.min(35, mvp / 3) : 0;

  return { ideaValidation, opportunityDiscovery, cpf, psf, mvp, pmf };
}

export function topGapSummary(gaps: string[]): string {
  if (gaps.length === 0) return "No major gaps flagged — keep validating with real users.";
  return gaps[0];
}

export const pmfStageToReadinessKey: Record<PmfStage, keyof PmfReadiness> = {
  idea_validation: "ideaValidation",
  opportunity_discovery: "opportunityDiscovery",
  cpf: "cpf",
  psf: "psf",
  mvp: "mvp",
  pmf: "pmf",
};

export function readinessScoreForStage(readiness: PmfReadiness, stage: PmfStage): number {
  return readiness[pmfStageToReadinessKey[stage]];
}

export function topNextAction(actions: string[]): string {
  if (actions.length === 0) return "Review Planner reasoning and confirm assumptions.";
  return actions[0];
}

export function clarificationLimits(mode: DiscoveryMode): {
  maxPerRound: number;
  maxRounds: number;
  maxTotalQuick: number;
} {
  if (mode === "quick") {
    return { maxPerRound: 3, maxRounds: 3, maxTotalQuick: 3 };
  }
  return { maxPerRound: 10, maxRounds: 3, maxTotalQuick: 30 };
}

export function capQuestionsForMode(
  questions: { id: string }[],
  mode: DiscoveryMode,
  round: number,
  questionsAskedSoFar: number
): number {
  const limits = clarificationLimits(mode);
  if (mode === "quick") {
    const remaining = limits.maxTotalQuick - questionsAskedSoFar;
    return Math.min(questions.length, Math.max(0, remaining));
  }
  return Math.min(questions.length, limits.maxPerRound);
}
