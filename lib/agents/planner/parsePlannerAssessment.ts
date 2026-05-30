import type { PlannerClarificationAssessment, PlannerQuestion } from "@/lib/agents/planner/plannerClarification";
import { buildHeuristicClarificationAssessment, countQuestionsAsked } from "@/lib/agents/planner/plannerClarification";
import { computePmfReadinessFromSignals, defaultPmfReadiness } from "@/lib/pmf/pmfJourney";
import type { PmfReadiness } from "@/lib/pmf/pmfJourney";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";

const validCategories = new Set([
  "target_users",
  "platform",
  "business_model",
  "scope",
  "constraints",
  "success_metrics",
  "customer_problem",
  "solution_fit",
]);

function parseQuestions(raw: unknown): PlannerQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q): q is Record<string, unknown> => !!q && typeof q === "object")
    .map((q, index) => ({
      id: typeof q.id === "string" ? q.id : `q-${index}`,
      category: validCategories.has(q.category as string)
        ? (q.category as PlannerQuestion["category"])
        : "scope",
      question: typeof q.question === "string" ? q.question.trim() : "",
      reason: typeof q.reason === "string" ? q.reason.trim() : "",
      assumption: typeof q.assumption === "string" ? q.assumption.trim() : undefined,
    }))
    .filter((q) => q.question.length > 0)
    .slice(0, 10);
}

function parsePmfReadiness(raw: unknown, fallback: PmfReadiness): PmfReadiness {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const pick = (k: keyof PmfReadiness) =>
    typeof r[k] === "number" ? Math.max(0, Math.min(100, r[k] as number)) : fallback[k];
  return {
    ideaValidation: pick("ideaValidation"),
    opportunityDiscovery: pick("opportunityDiscovery"),
    cpf: pick("cpf"),
    psf: pick("psf"),
    mvp: pick("mvp"),
    pmf: pick("pmf"),
  };
}

export function parsePlannerAssessmentJson(
  content: string,
  fallback: {
    input: ProjectCreationInput;
    clarificationRound: number;
    clarificationNotes?: string;
    questionsAskedSoFar?: number;
    clarificationHistory?: Array<{ questions: PlannerQuestion[] }>;
  }
): {
  analysis: string;
  decisions: string[];
  reasoning: string[];
  assessment: PlannerClarificationAssessment;
} {
  const askedSoFar =
    fallback.questionsAskedSoFar ??
    (fallback.clarificationHistory ? countQuestionsAsked(fallback.clarificationHistory) : 0);

  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const assessmentRaw =
      parsed.assessment && typeof parsed.assessment === "object"
        ? (parsed.assessment as Record<string, unknown>)
        : parsed;

    const questions = parseQuestions(assessmentRaw.questions ?? parsed.questions);
    const missingAreas = Array.isArray(assessmentRaw.missingAreas)
      ? assessmentRaw.missingAreas.filter((m): m is string => typeof m === "string")
      : [];

    const completenessScore =
      typeof assessmentRaw.completenessScore === "number"
        ? Math.max(0, Math.min(100, assessmentRaw.completenessScore))
        : 50;

    const strengths = Array.isArray(parsed.strengths)
      ? parsed.strengths.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.strengths)
        ? assessmentRaw.strengths.filter((s): s is string => typeof s === "string")
        : [];

    const gaps = Array.isArray(parsed.gaps)
      ? parsed.gaps.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.gaps)
        ? assessmentRaw.gaps.filter((s): s is string => typeof s === "string")
        : [];

    const nextActions = Array.isArray(parsed.nextActions)
      ? parsed.nextActions.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.nextActions)
        ? assessmentRaw.nextActions.filter((s): s is string => typeof s === "string")
        : [];

    const opportunities = Array.isArray(parsed.opportunities)
      ? parsed.opportunities.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.opportunities)
        ? assessmentRaw.opportunities.filter((s): s is string => typeof s === "string")
        : [];

    const threats = Array.isArray(parsed.threats)
      ? parsed.threats.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.threats)
        ? assessmentRaw.threats.filter((s): s is string => typeof s === "string")
        : [];

    const painPoints = Array.isArray(parsed.painPoints)
      ? parsed.painPoints.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.painPoints)
        ? assessmentRaw.painPoints.filter((s): s is string => typeof s === "string")
        : [];

    const burningNeeds = Array.isArray(parsed.burningNeeds)
      ? parsed.burningNeeds.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.burningNeeds)
        ? assessmentRaw.burningNeeds.filter((s): s is string => typeof s === "string")
        : [];

    const validationAssumptions = Array.isArray(parsed.validationAssumptions)
      ? parsed.validationAssumptions.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.validationAssumptions)
        ? assessmentRaw.validationAssumptions.filter((s): s is string => typeof s === "string")
        : [];

    const validationRisks = Array.isArray(parsed.validationRisks)
      ? parsed.validationRisks.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.validationRisks)
        ? assessmentRaw.validationRisks.filter((s): s is string => typeof s === "string")
        : [];

    const mvpScope = Array.isArray(parsed.mvpScope)
      ? parsed.mvpScope.filter((s): s is string => typeof s === "string")
      : Array.isArray(assessmentRaw.mvpScope)
        ? assessmentRaw.mvpScope.filter((s): s is string => typeof s === "string")
        : [];

    const pmfReadiness = parsePmfReadiness(
      assessmentRaw.pmfReadiness ?? parsed.pmfReadiness,
      computePmfReadinessFromSignals({
        completenessScore,
        missingAreas,
        strengths,
        gaps,
        hasBrief: false,
        discoveryMode: fallback.input.discoveryMode ?? "quick",
      })
    );

    const needsClarification =
      typeof assessmentRaw.needsClarification === "boolean"
        ? assessmentRaw.needsClarification
        : questions.length > 0;

    const assessment: PlannerClarificationAssessment = {
      completenessScore,
      needsClarification: needsClarification && questions.length > 0,
      missingAreas,
      questions,
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
      pmfReadiness,
    };

    if (assessment.strengths.length === 0 && assessment.questions.length === 0) {
      return {
        analysis:
          typeof parsed.analysis === "string"
            ? parsed.analysis
            : "Planner assessed information completeness.",
        decisions: Array.isArray(parsed.decisions)
          ? parsed.decisions.filter((d): d is string => typeof d === "string")
          : [],
        reasoning: Array.isArray(parsed.reasoning)
          ? parsed.reasoning.filter((r): r is string => typeof r === "string")
          : [],
        assessment: buildHeuristicClarificationAssessment({
          input: fallback.input,
          clarificationRound: fallback.clarificationRound,
          clarificationNotes: fallback.clarificationNotes,
          questionsAskedSoFar: askedSoFar,
        }),
      };
    }

    return {
      analysis:
        typeof parsed.analysis === "string"
          ? parsed.analysis
          : "Planner assessed information completeness before drafting a brief.",
      decisions: Array.isArray(parsed.decisions)
        ? parsed.decisions.filter((d): d is string => typeof d === "string")
        : ["Evaluate completeness before generating a Product Brief"],
      reasoning: Array.isArray(parsed.reasoning)
        ? parsed.reasoning.filter((r): r is string => typeof r === "string")
        : [
            "A Product Manager clarifies ambiguity before committing to scope.",
            "Prefer confirming assumptions over asking unnecessary questions.",
          ],
      assessment,
    };
  } catch {
    const heuristic = buildHeuristicClarificationAssessment({
      input: fallback.input,
      clarificationRound: fallback.clarificationRound,
      clarificationNotes: fallback.clarificationNotes,
      questionsAskedSoFar: askedSoFar,
    });
    return {
      analysis: "Planner used structured heuristics to evaluate requirement completeness.",
      decisions: ["Request clarification before Product Brief generation"],
      reasoning: heuristic.gaps.map((g) => `WHY: Address gap — ${g}`),
      assessment: heuristic,
    };
  }
}
