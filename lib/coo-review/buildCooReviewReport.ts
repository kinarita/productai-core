import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import { opportunityAuditFromBrief } from "@/lib/opportunity/opportunityTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import { inferCooReviewRecommendation } from "@/lib/coo-review/cooReviewDecision";
import type {
  CooReviewRecommendation,
  CooReviewReport,
  CooReviewScores,
} from "@/lib/coo-review/cooReviewTypes";
import { roundReadinessScore } from "@/lib/pmf/pmfStatus";

export interface CooReviewInput {
  projectName: string;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  brief?: ProductBriefSections;
  assessment?: PlannerClarificationAssessment;
  auditSummary?: string;
  discoveryInsights?: {
    strengths?: string[];
    gaps?: string[];
    nextActions?: string[];
    painPoints?: string[];
    validationRisks?: string[];
    validationAssumptions?: string[];
    mvpScope?: string[];
  };
}

function scoreMvpFeasibility(
  psfReport?: ProblemSolutionFitReport,
  brief?: ProductBriefSections
): number {
  let score = 45;
  if (psfReport) {
    score = Math.min(100, psfReport.psfScore - 5);
    if (psfReport.mvpFeatures.mustHave.length >= 2) score += 8;
    if (psfReport.mvpFeatures.wontHave.length >= 1) score += 5;
  }
  if (brief) {
    if (brief.coreFeatures.length >= 2) score += 10;
    if (brief.outOfScope.length >= 1) score += 5;
    if (brief.risks.length <= 3) score += 3;
  }
  return roundReadinessScore(score);
}

function scoreRiskLevel(input: CooReviewInput): number {
  const risks = [
    ...(input.psfReport?.validationRisks ?? []),
    ...(input.brief?.risks ?? []),
    ...(input.discoveryInsights?.validationRisks ?? []),
    ...(input.discoveryInsights?.gaps ?? []),
  ];
  const base = risks.length * 12;
  const recPenalty =
    input.opportunityBrief?.recommendedAction === "hold" ||
    input.cpfReport?.recommendation === "hold" ||
    input.psfReport?.recommendation === "hold"
      ? 25
      : 0;
  return roundReadinessScore(Math.min(100, base + recPenalty));
}

function scoreStrategicFit(scores: Omit<CooReviewScores, "strategicFit">): number {
  const upside =
    scores.marketOpportunity * 0.25 +
    scores.problemSeverity * 0.25 +
    scores.solutionConfidence * 0.25 +
    scores.mvpFeasibility * 0.25;
  const riskPenalty = scores.riskLevel * 0.35;
  return roundReadinessScore(Math.max(0, upside - riskPenalty * 0.5));
}

function buildOverallScore(scores: CooReviewScores): number {
  const weighted =
    scores.marketOpportunity * 0.2 +
    scores.problemSeverity * 0.2 +
    scores.solutionConfidence * 0.2 +
    scores.mvpFeasibility * 0.15 +
    scores.strategicFit * 0.15 +
    (100 - scores.riskLevel) * 0.1;
  return roundReadinessScore(weighted);
}

export function buildCooReviewReport(input: CooReviewInput): CooReviewReport {
  const opportunityFields = input.opportunityBrief
    ? opportunityAuditFromBrief(input.opportunityBrief)
    : undefined;

  const opportunityScore = roundReadinessScore(
    input.opportunityBrief?.plannerConfidence ??
      opportunityFields?.opportunityScore ??
      input.assessment?.pmfReadiness.opportunityDiscovery ??
      50
  );
  const cpfScore = roundReadinessScore(
    input.cpfReport?.cpfScore ?? input.assessment?.pmfReadiness.cpf ?? 50
  );
  const psfScore = roundReadinessScore(
    input.psfReport?.psfScore ?? input.assessment?.pmfReadiness.psf ?? 50
  );

  const scores: CooReviewScores = {
    marketOpportunity: opportunityScore,
    problemSeverity: roundReadinessScore(
      input.cpfReport?.cpfScore ?? input.cpfReport?.burningNeedScore ?? cpfScore
    ),
    solutionConfidence: psfScore,
    mvpFeasibility: scoreMvpFeasibility(input.psfReport, input.brief),
    riskLevel: scoreRiskLevel(input),
    strategicFit: 0,
  };
  scores.strategicFit = scoreStrategicFit(scores);

  const recommendation = inferCooReviewRecommendation({
    opportunityScore,
    cpfScore,
    psfScore,
  });
  const overallScore = buildOverallScore(scores);

  const strengths = uniqueNonEmpty([
    ...(input.discoveryInsights?.strengths ?? []),
    ...(input.assessment?.strengths ?? []),
    input.opportunityBrief?.opportunityHypothesis
      ? `Opportunity hypothesis: ${input.opportunityBrief.opportunityHypothesis}`
      : "",
    input.psfReport?.solutionHypothesis
      ? `Solution direction: ${input.psfReport.solutionHypothesis}`
      : "",
    input.brief?.coreFeatures.length
      ? `MVP scope defined (${input.brief.coreFeatures.length} core features)`
      : "",
  ]).slice(0, 5);

  const concerns = uniqueNonEmpty([
    ...(input.discoveryInsights?.gaps ?? []),
    ...(input.assessment?.gaps ?? []),
    ...(input.psfReport?.validationRisks ?? []),
    ...(input.brief?.risks ?? []),
    input.opportunityBrief?.recommendedAction === "needs_validation"
      ? "Opportunity still needs external validation"
      : "",
    input.cpfReport?.recommendation === "validate_more"
      ? "Customer problem fit requires more evidence"
      : "",
  ]).slice(0, 5);

  const requiredActions = buildRequiredActions(recommendation, input, concerns);

  const executiveSummary = buildExecutiveSummary(
    input.projectName,
    recommendation,
    overallScore,
    opportunityScore,
    cpfScore,
    psfScore
  );

  return {
    overallScore,
    recommendation,
    scores,
    executiveSummary,
    marketOpportunityAssessment: buildMarketAssessment(input, opportunityScore),
    customerProblemAssessment: buildCustomerAssessment(input, cpfScore),
    solutionAssessment: buildSolutionAssessment(input, psfScore),
    riskAssessment: buildRiskAssessment(input, scores.riskLevel),
    strengths,
    concerns,
    requiredActions,
    reviewedAt: new Date().toISOString(),
  };
}

function uniqueNonEmpty(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}

function buildRequiredActions(
  recommendation: CooReviewRecommendation,
  input: CooReviewInput,
  concerns: string[]
): string[] {
  const base = uniqueNonEmpty([
    ...(input.discoveryInsights?.nextActions ?? []),
    ...(input.assessment?.nextActions ?? []),
    ...(input.psfReport?.validationPlan ?? []).slice(0, 2),
  ]);

  switch (recommendation) {
    case "PROCEED":
      return uniqueNonEmpty([
        "Recommend CEO approve architecture phase",
        "Prepare Architect Agent handoff after human approval",
        ...base.slice(0, 2),
      ]).slice(0, 4);
    case "VALIDATE MORE":
      return uniqueNonEmpty([
        "Recommend CEO request additional Planner validation",
        "Validate top assumptions with target customers",
        "Strengthen competitive and alternative analysis",
        ...concerns.slice(0, 2),
        ...base,
      ]).slice(0, 5);
    case "HOLD":
      return uniqueNonEmpty([
        "Recommend CEO pause architecture and build",
        "Document why this idea may not be worth pursuing now",
        ...concerns.slice(0, 2),
      ]).slice(0, 4);
  }
}

function buildExecutiveSummary(
  projectName: string,
  recommendation: CooReviewRecommendation,
  overallScore: number,
  opportunity: number,
  cpf: number,
  psf: number
): string {
  const actionPhrase =
    recommendation === "PROCEED"
      ? "proceeding to the architecture phase"
      : recommendation === "VALIDATE MORE"
        ? "additional validation before architecture"
        : "pausing this project for now";

  return (
    `COO Recommendation for "${projectName}" — overall score ${overallScore}/100. ` +
    `Based on Opportunity Discovery, Customer Problem Fit, Problem Solution Fit, and MVP feasibility, ` +
    `the COO recommends ${actionPhrase}. ` +
    `Scores: opportunity ${opportunity}, customer problem ${cpf}, solution fit ${psf}. ` +
    `This is an AI advisory recommendation — final approval belongs to the CEO.`
  );
}

function buildMarketAssessment(input: CooReviewInput, score: number): string {
  if (!input.opportunityBrief) {
    return "Market opportunity was not fully documented — treat opportunity score as provisional.";
  }
  return (
    `Market opportunity scored ${score}/100. ` +
    `Evidence level: ${input.opportunityBrief.evidenceLevel}. ` +
    `${input.opportunityBrief.opportunitySummary}`
  );
}

function buildCustomerAssessment(input: CooReviewInput, score: number): string {
  if (!input.cpfReport) {
    return "Customer Problem Fit report missing — problem severity is estimated from planner assessment only.";
  }
  const topPain = input.cpfReport.painPoints[0]?.text ?? "Primary pain not ranked";
  return (
    `Problem severity ${score}/100 (burning need ${input.cpfReport.burningNeedScore}/100). ` +
    `Top pain: ${topPain}. Recommendation: ${input.cpfReport.recommendation}.`
  );
}

function buildSolutionAssessment(input: CooReviewInput, score: number): string {
  if (!input.psfReport) {
    return "Problem Solution Fit report missing — solution confidence is estimated from planner signals.";
  }
  return (
    `Solution confidence ${score}/100 (${input.psfReport.confidenceLevel} confidence). ` +
    `Hypothesis: ${input.psfReport.solutionHypothesis}. ` +
    `Expected outcome: ${input.psfReport.expectedOutcome}`
  );
}

function buildRiskAssessment(input: CooReviewInput, riskLevel: number): string {
  const topRisk =
    input.psfReport?.validationRisks[0] ??
    input.brief?.risks[0] ??
    input.discoveryInsights?.validationRisks?.[0] ??
    "Unvalidated assumptions remain";
  return (
    `Risk level ${riskLevel}/100 (higher = more dangerous). ` +
    `Primary risk: ${topRisk}. ` +
    (input.brief?.outOfScope.length
      ? `Explicit out-of-scope: ${input.brief.outOfScope.slice(0, 2).join("; ")}.`
      : "MVP boundaries should be tightened before build.")
  );
}
