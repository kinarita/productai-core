import { NextResponse } from "next/server";
import { runPlannerPsfAnalysis } from "@/lib/agents/planner/runPlannerPsf";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlannerProviderInput & {
      assessment?: PlannerClarificationAssessment;
      opportunityBrief?: OpportunityBrief;
      cpfReport?: CustomerProblemFitReport;
    };

    if (!body.idea?.trim() || !body.projectName?.trim()) {
      return NextResponse.json({ error: "idea and projectName are required" }, { status: 400 });
    }

    const result = runPlannerPsfAnalysis({
      providerInput: body,
      cpfReport: body.cpfReport,
      opportunityBrief: body.opportunityBrief,
      assessment: body.assessment,
    });

    return NextResponse.json({
      psfReport: result.psfReport,
      pmfReadiness: result.pmfReadiness,
      currentPmfStage: result.currentPmfStage,
      validationAssumptions: result.validationAssumptions,
      validationRisks: result.validationRisks,
      mvpScope: result.mvpScope,
      audit: result.audit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PSF analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
