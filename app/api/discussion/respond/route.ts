import { NextResponse } from "next/server";
import {
  runDiscussionRespond,
  type DiscussionContextInput,
} from "@/lib/discussion/runDiscussionRespond";
import type { DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { CooReviewReport } from "@/lib/coo-review/cooReviewTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DiscussionContextInput & {
      userMessage?: string;
      discussionMessages?: DiscussionMessage[];
    };

    if (!body.missionId?.trim() || !body.userMessage?.trim()) {
      return NextResponse.json(
        { error: "missionId and userMessage are required" },
        { status: 400 }
      );
    }

    const result = await runDiscussionRespond({
      missionId: body.missionId,
      projectName: body.projectName ?? "Project",
      idea: body.idea ?? "",
      targetUsers: body.targetUsers ?? "",
      successGoal: body.successGoal ?? "",
      missionSummary: body.missionSummary,
      brief: body.brief,
      briefVersion: body.briefVersion,
      opportunityBrief: body.opportunityBrief,
      cpfReport: body.cpfReport,
      psfReport: body.psfReport,
      psfMvpScope: body.psfMvpScope,
      cooReview: body.cooReview,
      validationRequests: body.validationRequests,
      discussionMessages: body.discussionMessages,
      userMessage: body.userMessage.trim(),
    });

    return NextResponse.json({
      plannerResponse: result.plannerResponse,
      plannerSummary: result.plannerSummary,
      plannerDetail: result.plannerDetail,
      cooResponse: result.cooResponse,
      cooSummary: result.cooSummary,
      cooDetail: result.cooDetail,
      suggestedChanges: result.suggestedChanges,
      relatedSection: result.relatedSection,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discussion response failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
