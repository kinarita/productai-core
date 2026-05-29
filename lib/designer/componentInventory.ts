export interface ComponentInventoryRow {
  componentName: string;
  purpose: string;
  screenUsage: string;
  notes: string;
}

export function buildComponentInventory(): ComponentInventoryRow[] {
  return [
    {
      componentName: "Mission Card",
      purpose: "Summarize mission health and progress.",
      screenUsage: "CEO Home, Missions list",
      notes: "Display only—no auto mission creation.",
    },
    {
      componentName: "Review Card",
      purpose: "Artifact review state and comments entry.",
      screenUsage: "Artifact Review Workspace",
      notes: "Human review support only.",
    },
    {
      componentName: "Status Badge",
      purpose: "Lifecycle and review state visibility.",
      screenUsage: "Workspaces, Mission Detail",
      notes: "Maps to planning/design states.",
    },
    {
      componentName: "Navigation Panel",
      purpose: "Sidebar workspace navigation.",
      screenUsage: "AppShell sidebar",
      notes: "Includes Designer Workspace route.",
    },
    {
      componentName: "Workspace Header",
      purpose: "Title, description, and upstream links.",
      screenUsage: "All workspace views",
      notes: "Links to prior role workspaces.",
    },
    {
      componentName: "Summary Panel",
      purpose: "Overview metrics for executive reading.",
      screenUsage: "CEO Home overview cards",
      notes: "Design Overview metrics.",
    },
    {
      componentName: "Readiness Panel",
      purpose: "Design or architecture readiness areas.",
      screenUsage: "Designer, Architect workspaces",
      notes: "Recommendation only.",
    },
  ];
}
