import type { Mission } from "@/types/productai";

export interface ScreenInventoryRow {
  screenName: string;
  purpose: string;
  relatedFlow: string;
  notes: string;
}

export function buildScreenInventory(mission: Mission): ScreenInventoryRow[] {
  const missionSlug = mission.name;
  return [
    {
      screenName: "CEO Home",
      purpose: "Executive overview and workspace entry.",
      relatedFlow: "Primary flow — entry",
      notes: "Links to mission and design workspaces.",
    },
    {
      screenName: "Mission Detail",
      purpose: `Operational context for ${missionSlug}.`,
      relatedFlow: "Primary flow — mission context",
      notes: "Design Context panel surfaces UX artifacts.",
    },
    {
      screenName: "Product Brief Workspace",
      purpose: "Planning approval layer visibility.",
      relatedFlow: "Planning continuity",
      notes: "Upstream from design intake.",
    },
    {
      screenName: "Director Workspace",
      purpose: "Mission plan and delivery framing.",
      relatedFlow: "Planning continuity",
      notes: "Feeds Architect and Designer handoff.",
    },
    {
      screenName: "Architect Workspace",
      purpose: "Technical specification and architecture review.",
      relatedFlow: "Design intake source",
      notes: "Technical Specification Intake for Designer.",
    },
    {
      screenName: "Designer Workspace",
      purpose: "UX specification and design review.",
      relatedFlow: "Primary flow — design",
      notes: "This workspace—no UI code generation.",
    },
    {
      screenName: "Artifact Review Workspace",
      purpose: "Human review of design_specification and related artifacts.",
      relatedFlow: "Review exit",
      notes: "deep link: design_specification artifact.",
    },
    {
      screenName: "Organization Feed",
      purpose: "Continuity events for design milestones.",
      relatedFlow: "Alternative flow",
      notes: "user_flow_created, design_snapshot events.",
    },
  ];
}
