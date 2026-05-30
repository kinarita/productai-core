import { NextResponse } from "next/server";
import { runPlannerAgent } from "@/lib/agents/planner/runPlannerAgent";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idea?: string;
      targetUsers?: string;
      successGoal?: string;
      projectName?: string;
      missionId?: string;
      discoveryMode?: "quick" | "guided";
    };

    if (!body.idea?.trim() || !body.targetUsers?.trim() || !body.successGoal?.trim()) {
      return NextResponse.json(
        { error: "idea, targetUsers, and successGoal are required" },
        { status: 400 }
      );
    }

    const result = await runPlannerAgent({
      idea: body.idea.trim(),
      targetUsers: body.targetUsers.trim(),
      successGoal: body.successGoal.trim(),
      projectName: body.projectName?.trim() || body.idea.trim().split("\n")[0].slice(0, 48),
      missionId: body.missionId?.trim(),
      discoveryMode: body.discoveryMode === "guided" ? "guided" : "quick",
    });

    if (!result.output) {
      return NextResponse.json(
        { error: "Unable to generate Product Brief", audit: result.audit },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Planner generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
