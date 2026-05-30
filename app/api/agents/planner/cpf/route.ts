import { NextResponse } from "next/server";
import { runPlannerCpfAnalysis } from "@/lib/agents/planner/runPlannerCpf";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlannerProviderInput & {
      assessment?: PlannerClarificationAssessment;
      opportunityBrief?: OpportunityBrief;
    };

    if (!body.idea?.trim() || !body.projectName?.trim()) {
      return NextResponse.json({ error: "idea and projectName are required" }, { status: 400 });
    }

    const result = runPlannerCpfAnalysis({
      providerInput: body,
      opportunityBrief: body.opportunityBrief,
      assessment: body.assessment,
    });

    return NextResponse.json({
      cpfReport: result.cpfReport,
      pmfReadiness: result.pmfReadiness,
      currentPmfStage: result.currentPmfStage,
      painPoints: result.painPoints,
      burningNeeds: result.burningNeeds,
      audit: result.audit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CPF analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
