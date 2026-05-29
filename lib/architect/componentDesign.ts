import type { Mission } from "@/types/productai";

export interface ComponentDesignRow {
  name: string;
  responsibility: string;
  dependencies: string;
  notes: string;
}

export function buildComponentDesign(mission: Mission): ComponentDesignRow[] {
  return [
    {
      name: "UI Layer",
      responsibility: "CEO-readable workspaces, boards, and review panels.",
      dependencies: "Design tokens, AppShell, Card components",
      notes: `Lifecycle: ${mission.lifecycle}`,
    },
    {
      name: "Application Layer",
      responsibility: "Hooks and stores coordinating mission, task, and workspace state.",
      dependencies: "Zustand persist, mission store",
      notes: "No autonomous execution routing.",
    },
    {
      name: "Domain Layer",
      responsibility: "Brief, director, and architect analysis builders.",
      dependencies: "ProductAI types, handoff workflow",
      notes: mission.name,
    },
    {
      name: "Data Layer",
      responsibility: "Mission, Task, Feed, and artifact review records.",
      dependencies: "mockData seeds, localStorage",
      notes: "Display and planning support only.",
    },
  ];
}
