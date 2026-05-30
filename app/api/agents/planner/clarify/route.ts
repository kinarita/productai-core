import { NextResponse } from "next/server";
import {
  formatClarificationNotes,
  MAX_CLARIFICATION_ROUNDS,
} from "@/lib/agents/planner/plannerClarification";
import { mergeClarificationIntoInput } from "@/lib/agents/planner/plannerClarification";
import { runPlannerAssess } from "@/lib/agents/planner/runPlannerAssess";
import { runPlannerAgent } from "@/lib/agents/planner/runPlannerAgent";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      missionId?: string;
      idea?: string;
      targetUsers?: string;
      successGoal?: string;
      projectName?: string;
      clarifications?: string;
      clarificationRound?: number;
      discoveryMode?: "quick" | "guided";
      answers?: Record<string, string>;
      history?: Array<{ round: number; answers: Record<string, string> }>;
    };

    if (!body.missionId?.trim() || !body.idea?.trim() || !body.answers) {
      return NextResponse.json(
        { error: "missionId, idea, and answers are required" },
        { status: 400 }
      );
    }

    const round = (body.clarificationRound ?? 0) + 1;
    if (round > MAX_CLARIFICATION_ROUNDS) {
      return NextResponse.json(
        { error: "Maximum clarification rounds reached" },
        { status: 400 }
      );
    }

    const history = [
      ...(body.history ?? []),
      { round, answers: body.answers },
    ];
    const clarificationText = formatClarificationNotes(history);
    const mergedInput = mergeClarificationIntoInput(
      {
        idea: body.idea.trim(),
        targetUsers: body.targetUsers?.trim() ?? "",
        successGoal: body.successGoal?.trim() ?? "",
        discoveryMode: body.discoveryMode ?? "quick",
        clarifications: clarificationText,
      },
      clarificationText
    );

    const providerInput = {
      ...mergedInput,
      projectName:
        body.projectName?.trim() || body.idea.trim().split("\n")[0].slice(0, 48),
      missionId: body.missionId.trim(),
      clarificationRound: round,
      discoveryMode: body.discoveryMode ?? "quick",
    };

    const assess = await runPlannerAssess(providerInput);

    if (
      assess.assessment.needsClarification &&
      assess.assessment.questions.length > 0 &&
      round < MAX_CLARIFICATION_ROUNDS
    ) {
      return NextResponse.json({
        phase: "clarification" as const,
        clarificationRound: round,
        mergedInput,
        ...assess,
      });
    }

    const brief = await runPlannerAgent(providerInput);
    if (!brief.output) {
      return NextResponse.json(
        { error: "Unable to generate Product Brief", audit: brief.audit },
        { status: 500 }
      );
    }

    return NextResponse.json({
      phase: "brief" as const,
      clarificationRound: round,
      mergedInput,
      assessment: assess.assessment,
      analysis: assess.analysis,
      reasoning: [...assess.reasoning, ...brief.output.reasoning],
      ...brief,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Planner clarification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
