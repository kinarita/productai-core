import type { Mission } from "@/types/productai";
import { defaultPmfReadiness } from "@/lib/pmf/pmfJourney";
import type { ProjectCreationInput } from "@/lib/project-creation/projectCreationTypes";

function slugId(): string {
  return `m-${Date.now()}`;
}

function projectNameFromIdea(idea: string): string {
  const firstLine = idea.split("\n")[0]?.trim() ?? idea.trim();
  if (firstLine.length <= 48) return firstLine;
  return `${firstLine.slice(0, 45)}…`;
}

export function buildPlanningPlaceholderBrief(name: string): string {
  return [
    `# Product Brief — ${name}`,
    "",
    "_Product Planner is analyzing your input. Reasoning and the full brief will appear here when generation completes._",
    "",
    "## Your input (pending synthesis)",
    "The Planner will turn your idea, target users, and success goal into a structured Product Brief.",
  ].join("\n");
}

export function buildMissionFromProjectInput(input: ProjectCreationInput): Mission {
  const id = slugId();
  const name = projectNameFromIdea(input.idea);
  const brief = buildPlanningPlaceholderBrief(name);

  return {
    id,
    name,
    description: input.idea.trim(),
    summary: `Discovery started — Product Planner is evaluating whether to build ${name}.`,
    status: "planning",
    lifecycle: "Idea",
    progress: 12,
    discoveryMode: input.discoveryMode,
    currentPmfStage: "opportunity_discovery",
    pmfReadiness: defaultPmfReadiness(),
    health: "stable",
    assignedAgents: ["COO"],
    blockers: [],
    recentActivity: "Discovery started — PMF assessment pending",
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
