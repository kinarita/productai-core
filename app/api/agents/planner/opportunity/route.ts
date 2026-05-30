import { NextResponse } from "next/server";
import { runPlannerOpportunityDiscovery } from "@/lib/agents/planner/runPlannerOpportunity";
import type { PlannerClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlannerProviderInput & {
      assessment?: PlannerClarificationAssessment;
    };

    if (!body.idea?.trim() || !body.projectName?.trim()) {
      return NextResponse.json({ error: "idea and projectName are required" }, { status: 400 });
    }

    const result = runPlannerOpportunityDiscovery({
      providerInput: body,
      assessment: body.assessment,
    });

    return NextResponse.json({
      opportunityBrief: result.opportunityBrief,
      pmfReadiness: result.pmfReadiness,
      currentPmfStage: result.currentPmfStage,
      audit: result.audit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Opportunity discovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
