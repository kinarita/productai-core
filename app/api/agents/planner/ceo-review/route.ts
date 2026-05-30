import { NextResponse } from "next/server";
import { runCooReview } from "@/lib/agents/coo/runCooReview";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";

/** @deprecated Phase 21.5 — use /api/agents/planner/coo-review */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlannerProviderInput & {
      opportunityBrief?: OpportunityBrief;
      cpfReport?: CustomerProblemFitReport;
      psfReport?: ProblemSolutionFitReport;
      brief?: ProductBriefSections;
      assessment?: PlannerClarificationAssessment;
      auditSummary?: string;
      discoveryInsights?: Record<string, unknown>;
    };

    const result = runCooReview({
      providerInput: body,
      opportunityBrief: body.opportunityBrief,
      cpfReport: body.cpfReport,
      psfReport: body.psfReport,
      brief: body.brief,
      assessment: body.assessment,
      auditSummary: body.auditSummary,
      discoveryInsights: body.discoveryInsights as Parameters<typeof runCooReview>[0]["discoveryInsights"],
    });

    return NextResponse.json({
      cooReviewReport: result.cooReviewReport,
      ceoReviewReport: result.cooReviewReport,
      audit: result.audit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "COO review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
