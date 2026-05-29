import type { ProductIdea } from "@/lib/idea/ideaWorkspace";

export interface ProblemDiscovery {
  targetUsers: string;
  coreProblem: string;
  currentAlternatives: string;
  painPoints: string[];
  opportunityAreas: string[];
}

export function buildProblemDiscovery(idea: ProductIdea): ProblemDiscovery {
  const missionHint = idea.relatedMissionName ?? idea.title;

  return {
    targetUsers:
      idea.tags.includes("enterprise")
        ? "Enterprise administrators and member users"
        : idea.tags.includes("mobile")
          ? "Mobile-first consumers onboarding to the product"
          : "Product operators and executive stakeholders",
    coreProblem: idea.description.slice(0, 200) || `Users need a clearer path to value for ${missionHint}.`,
    currentAlternatives:
      "Manual workflows, fragmented tools, or legacy portals without integrated mission context.",
    painPoints: [
      "Fragmented visibility across planning and delivery",
      "Slow iteration from idea to scoped MVP",
      "Unclear ownership between CEO framing and Planner organization",
    ],
    opportunityAreas: [
      "Self-service experiences with executive-readable summaries",
      "Faster alignment from idea capture to Product Brief",
      "Continuity from planning through mission direction",
    ],
  };
}
