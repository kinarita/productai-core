import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";

export function formatProductBriefMarkdown(
  projectName: string,
  brief: ProductBriefSections
): string {
  return [
    `# Product Brief — ${projectName}`,
    "",
    "## Project Summary",
    brief.projectSummary,
    "",
    "## Problem Statement",
    brief.problemStatement,
    "",
    "## Target Users",
    brief.targetUsers,
    "",
    "## Success Metrics",
    brief.successMetrics,
    "",
    "## Core Features",
    ...brief.coreFeatures.map((f) => `- ${f}`),
    "",
    "## Out of Scope",
    ...brief.outOfScope.map((f) => `- ${f}`),
    "",
    "## Risks",
    ...brief.risks.map((f) => `- ${f}`),
    "",
    "## Recommended Next Step",
    brief.recommendedNextStep,
  ].join("\n");
}
