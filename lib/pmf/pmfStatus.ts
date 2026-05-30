import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { PmfReadiness } from "@/lib/pmf/pmfJourney";

/**
 * Actual Product-Market Fit measurement state (requires real users and usage data).
 *
 * **PMF Measurement Status ≠ PMF Readiness score.**
 * - `pmfReadinessScore` (0–100): pre-launch discovery progress estimate.
 * - `PmfMeasurementStatus`: whether PMF can be or has been measured in production.
 */
export type PmfMeasurementStatus = "not_measured" | "emerging" | "achieved";

export interface PmfMeasurementContext {
  /** MVP shipped to real users (e.g. production release). */
  hasMvpReleased?: boolean;
  /** Observed product usage (sessions, active users, retention cohort, etc.). */
  hasUserUsage?: boolean;
  /** Future: retention / revenue thresholds met for CEO Review Gate. */
  hasValidatedPmfSignals?: boolean;
}

export interface PmfValidationMilestone {
  id: "opportunity" | "cpf" | "psf" | "mvp" | "pmf";
  label: string;
}

/** Pre-launch validation journey — distinct from achieved PMF. */
export const PMF_VALIDATION_MILESTONES: PmfValidationMilestone[] = [
  { id: "opportunity", label: "Opportunity Validated" },
  { id: "cpf", label: "Customer Problem Validated" },
  { id: "psf", label: "Solution Fit Validated" },
  { id: "mvp", label: "MVP Validation" },
  { id: "pmf", label: "Product-Market Fit" },
];

export const pmfMeasurementStatusLabels: Record<
  PmfMeasurementStatus,
  { title: string; summary: string }
> = {
  not_measured: {
    title: "Not Measured",
    summary: "PMF cannot be assessed until real users use the product.",
  },
  emerging: {
    title: "Emerging",
    summary: "MVP is live and users are engaging — early PMF signals can be tracked.",
  },
  achieved: {
    title: "Achieved",
    summary: "PMF validated with real usage and retention data (future CEO Review Gate).",
  },
};

export const pmfNotYetMeasurableCopy = {
  status: "Not Yet Measurable",
  description:
    "PMF can only be validated after real users use the product. Current focus is validating opportunity, customer problems, and solution fit.",
};

export const pmfPlannerExplanation = {
  lead: "You are currently validating whether this idea is worth building.",
  pmfNote: "PMF cannot be measured until real users use the product.",
  focusTitle: "Focus now:",
  focusItems: [
    "Opportunity Discovery",
    "Customer Problem Fit",
    "Problem Solution Fit",
    "MVP Validation",
  ],
};

/** Round internal readiness scores to whole numbers (never expose long floats). */
export function roundReadinessScore(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score)));
}

/** Display percent — integer or one decimal, never raw float noise. */
export function formatReadinessPercent(score: number): string {
  const clamped = Math.min(100, Math.max(0, score));
  const rounded = Math.round(clamped * 10) / 10;
  if (Number.isInteger(rounded)) return `${Math.round(rounded)}%`;
  return `${rounded.toFixed(1)}%`;
}

/**
 * Aggregate pre-launch readiness (0–100).
 *
 * **This is NOT achieved Product-Market Fit** — only discovery / MVP-definition progress.
 * The legacy `PmfReadiness.pmf` field must not be shown as PMF score in UI.
 */
export function computeAggregatePmfReadinessScore(readiness: PmfReadiness): number {
  const sum =
    readiness.opportunityDiscovery + readiness.cpf + readiness.psf + readiness.mvp;
  return roundReadinessScore(sum / 4);
}

export function inferPmfMeasurementStatus(
  ctx: PmfMeasurementContext = {}
): PmfMeasurementStatus {
  if (ctx.hasValidatedPmfSignals) return "achieved";
  if (ctx.hasMvpReleased && ctx.hasUserUsage) return "emerging";
  return "not_measured";
}

export function pmfValidationMilestoneState(run?: PlannerAgentRun): Record<
  PmfValidationMilestone["id"],
  boolean
> {
  const status = run?.pmfMeasurementStatus ?? "not_measured";
  return {
    opportunity: Boolean(run?.opportunityBrief),
    cpf: Boolean(run?.cpfReport),
    psf: Boolean(run?.psfReport),
    mvp: false,
    pmf: status === "emerging" || status === "achieved",
  };
}

export function derivePmfProjectFields(
  readiness: PmfReadiness,
  ctx: PmfMeasurementContext = {}
): {
  pmfReadinessScore: number;
  pmfMeasurementStatus: PmfMeasurementStatus;
} {
  return {
    pmfReadinessScore: computeAggregatePmfReadinessScore(readiness),
    pmfMeasurementStatus: inferPmfMeasurementStatus(ctx),
  };
}
