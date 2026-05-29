export interface ApiDesignRow {
  endpoint: string;
  purpose: string;
  consumer: string;
  notes: string;
}

export function buildApiDesign(missionId: string): ApiDesignRow[] {
  return [
    {
      endpoint: "GET /api/missions",
      purpose: "List missions for workspace continuity.",
      consumer: "CEO Home, Director Workspace",
      notes: "Read-only planning support.",
    },
    {
      endpoint: "GET /api/tasks",
      purpose: "Task breakdown visibility for Director and delivery.",
      consumer: "Director Workspace, Delivery Workspace",
      notes: "No auto task creation.",
    },
    {
      endpoint: "GET /api/feed",
      purpose: "Organization feed for planning and review events.",
      consumer: "Organization Feed",
      notes: "Includes architecture and brief events.",
    },
    {
      endpoint: `GET /missions/${missionId}`,
      purpose: "Mission detail architecture context.",
      consumer: "Mission Detail, Architect Workspace",
      notes: "Design documentation route—not code generation.",
    },
    {
      endpoint: "POST /api/judgments",
      purpose: "CEO judgment continuity.",
      consumer: "Judgment Center",
      notes: "Human authorization only.",
    },
  ];
}
