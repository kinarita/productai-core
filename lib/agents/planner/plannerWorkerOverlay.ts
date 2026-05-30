import type { AiWorkerMissionStatus } from "@/lib/agent-first/workerAnalysis";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import { formatProductBriefMarkdown } from "@/lib/agents/planner/formatProductBrief";

function projectNameFromIdea(idea: string): string {
  const firstLine = idea.split("\n")[0]?.trim() ?? idea.trim();
  if (firstLine.length <= 48) return firstLine;
  return `${firstLine.slice(0, 45)}…`;
}

const plannerStatusLabels: Record<PlannerAgentRun["status"], string> = {
  idle: "Idle",
  assessing: "Assessing Requirements",
  awaiting_clarification: "Awaiting Clarification",
  working: "Creating Brief",
  completed: "Completed",
  failed: "Failed",
};

export function mergePlannerIntoWorkerStatuses(
  statuses: AiWorkerMissionStatus[],
  run?: PlannerAgentRun
): AiWorkerMissionStatus[] {
  if (!run) return statuses;

  return statuses.map((entry) => {
    if (entry.worker.id !== "product_planner") return entry;

    const statusLabel = plannerStatusLabels[run.status];
    const status =
      run.status === "completed"
        ? "completed"
        : run.status === "assessing" || run.status === "working"
          ? "in_progress"
          : run.status === "failed"
            ? "in_progress"
            : run.status === "awaiting_clarification"
              ? "waiting"
              : "waiting";

    let explainability = { ...entry.explainability };

    if (run.status === "assessing") {
      explainability = {
        ...explainability,
        workSummary: "Discovery in progress — should we build this?",
        outputSummary: "PMF assessment running",
      };
    } else if (run.status === "awaiting_clarification") {
      explainability = {
        ...explainability,
        workSummary: "Planner needs additional information before drafting the Product Brief.",
        outputSummary: `${run.pendingQuestions?.length ?? 0} clarification question(s) pending`,
        whyReasons:
          run.pendingQuestions?.map((q) => `WHY: ${q.reason}`) ?? explainability.whyReasons,
      };
    } else if (run.status === "working") {
      explainability = {
        ...explainability,
        workSummary: "Planner is creating Product Brief…",
        outputSummary: "Product Brief — in progress",
      };
    } else if (run.status === "failed") {
      explainability = {
        ...explainability,
        workSummary: run.errorMessage ?? "Unable to generate Product Brief",
        outputSummary: "Generation failed — use Retry on the project page",
      };
    } else if (run.status === "completed" && run.brief) {
      const name = projectNameFromIdea(run.input.idea);
      explainability = {
        workSummary: run.analysis ?? explainability.workSummary,
        inputSummary: `CEO input plus ${run.clarificationHistory?.length ?? 0} clarification round(s).`,
        outputSummary: run.brief.projectSummary.slice(0, 220),
        whyReasons:
          run.reasoning.length > 0
            ? run.reasoning
            : run.decisions?.map((d) => `Decision: ${d}`) ?? explainability.whyReasons,
      };
    } else if (run.status === "idle") {
      explainability = {
        ...explainability,
        workSummary: "Planner is queued — assessment will start momentarily.",
        inputSummary: `Idea: ${run.input.idea.slice(0, 160)}`,
      };
    }

    return {
      ...entry,
      status,
      statusLabel,
      explainability,
      plannerRunStatus: run.status,
    };
  });
}

export function briefPreviewFromRun(run?: PlannerAgentRun, missionBrief?: string): string {
  if (run?.brief) {
    return formatProductBriefMarkdown(projectNameFromIdea(run.input.idea), run.brief);
  }
  return missionBrief ?? "";
}
