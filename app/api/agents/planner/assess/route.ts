import { NextResponse } from "next/server";
import { runPlannerAssess } from "@/lib/agents/planner/runPlannerAssess";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idea?: string;
      targetUsers?: string;
      successGoal?: string;
      projectName?: string;
      missionId?: string;
      clarifications?: string;
      clarificationRound?: number;
      discoveryMode?: "quick" | "guided";
    };

    if (!body.idea?.trim() || !body.targetUsers?.trim() || !body.successGoal?.trim()) {
      return NextResponse.json(
        { error: "idea, targetUsers, and successGoal are required" },
        { status: 400 }
      );
    }

    const result = await runPlannerAssess({
      idea: body.idea.trim(),
      targetUsers: body.targetUsers.trim(),
      successGoal: body.successGoal.trim(),
      clarifications: body.clarifications?.trim(),
      projectName: body.projectName?.trim() || body.idea.trim().split("\n")[0].slice(0, 48),
      missionId: body.missionId?.trim(),
      clarificationRound: body.clarificationRound ?? 0,
      discoveryMode: body.discoveryMode ?? "quick",
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Planner assessment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

