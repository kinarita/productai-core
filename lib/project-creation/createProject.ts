import type { Mission } from "@/types/productai";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";

function slugId(): string {
  return `m-${Date.now()}`;
}

function projectNameFromIdea(idea: string): string {
  const firstLine = idea.split("\n")[0]?.trim() ?? idea.trim();
  if (firstLine.length <= 48) return firstLine;
  return `${firstLine.slice(0, 45)}…`;
}

export function buildInitialProductBriefText(input: ProjectCreationInput): string {
  const name = projectNameFromIdea(input.idea);
  return [
    `# Product Brief — ${name}`,
    "",
    "## Vision",
    input.idea.trim(),
    "",
    "## Target users",
    input.targetUsers.trim(),
    "",
    "## Success goal",
    input.successGoal.trim(),
    "",
    "## MVP direction",
    `Deliver a focused first version of ${name} that proves the success goal with clear boundaries. Product Planner organized this brief for your review—no automatic approval or deployment.`,
    "",
    "## Open questions",
    "- What is the single most important user journey for v1?",
    "- Which integrations can wait until after launch?",
  ].join("\n");
}

export function buildMissionFromProjectInput(input: ProjectCreationInput): Mission {
  const id = slugId();
  const name = projectNameFromIdea(input.idea);
  const brief = buildInitialProductBriefText(input);

  return {
    id,
    name,
    description: input.idea.trim(),
    summary: `Planning started — Product Planner is drafting the Product Brief for ${name}.`,
    status: "planning",
    lifecycle: "Idea",
    progress: 18,
    health: "stable",
    assignedAgents: ["COO"],
    blockers: [],
    recentActivity: "Product Planner assigned — Planning Started",
    createdAt: "Just now",
    updatedAt: "Just now",
    requirementsSummary: brief,
    architectureSummary: "Technical design will begin after Product Brief review.",
    releaseReadiness: {
      score: 8,
      label: "Planning",
      summary: "New project — release readiness will be assessed after planning and build stages.",
      blockers: [],
    },
    relatedBranches: [],
    relatedPullRequests: [],
    memoryInsightIds: [],
    decisionIds: [],
    taskIds: [],
    activityIds: [],
  };
}
