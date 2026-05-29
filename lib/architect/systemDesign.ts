import type { Mission } from "@/types/productai";

export interface SystemDesignArea {
  id: string;
  label: string;
  summary: string;
}

export function buildSystemDesign(mission: Mission): SystemDesignArea[] {
  const base = mission.architectureSummary || mission.requirementsSummary;

  return [
    {
      id: "frontend",
      label: "Frontend",
      summary: `Executive dashboards and mission workspaces—${mission.lifecycle} phase emphasis. ${base.slice(0, 80)}`,
    },
    {
      id: "backend",
      label: "Backend",
      summary: `Next.js API routes and orchestration layers for ${mission.name}. Governance and feed continuity without autonomous execution.`,
    },
    {
      id: "database",
      label: "Database",
      summary: "localStorage persistence for workspace state; mission/task models derived from mock continuity layer.",
    },
    {
      id: "ai_services",
      label: "AI Services",
      summary: "AI organizes artifacts and recommendations—CEO and human roles authorize decisions.",
    },
    {
      id: "external",
      label: "External Integrations",
      summary: mission.relatedPullRequests.length
        ? `Repository context: ${mission.relatedPullRequests.join(", ")}—integration design only, no auto GitHub actions.`
        : "No external integrations flagged—design boundaries remain internal until stakeholders align.",
    },
  ];
}
