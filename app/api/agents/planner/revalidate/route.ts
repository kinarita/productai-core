import { NextResponse } from "next/server";
import { runPlannerRevalidation } from "@/lib/agents/planner/runPlannerRevalidation";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlannerProviderInput & {
      assessment?: PlannerClarificationAssessment;
      opportunityBrief?: OpportunityBrief;
      cpfReport?: CustomerProblemFitReport;
      psfReport?: ProblemSolutionFitReport;
      brief?: ProductBriefSections;
      validationReason?: string;
    };

    if (!body.validationReason?.trim()) {
      return NextResponse.json({ error: "validationReason is required" }, { status: 400 });
    }
    if (!body.brief) {
      return NextResponse.json({ error: "brief is required" }, { status: 400 });
    }

    const result = runPlannerRevalidation({
      providerInput: body,
      assessment: body.assessment,
      opportunityBrief: body.opportunityBrief,
      cpfReport: body.cpfReport,
      psfReport: body.psfReport,
      brief: body.brief,
      validationReason: body.validationReason,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Planner revalidation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
