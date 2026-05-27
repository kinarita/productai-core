import type { AgentRole, OrganizationFeedItem } from "@/types/productai";

type FeedTemplate = Omit<OrganizationFeedItem, "id" | "timestamp">;

const MISSIONS = [
  { missionId: "m-1", missionName: "Customer Portal v2" },
  { missionId: "m-2", missionName: "Analytics Pipeline" },
  { missionId: "m-3", missionName: "Mobile Onboarding" },
  { missionId: "m-4", missionName: "Internal Admin Tools" },
];

export const LIVE_FEED_TEMPLATES: FeedTemplate[] = [
  {
    type: "qa_review",
    author: "QA",
    authorName: "Lens",
    ...MISSIONS[2],
    message: "Posted review: regression suite stable on latest build.",
  },
  {
    type: "architecture",
    author: "Architect",
    authorName: "Sage",
    ...MISSIONS[1],
    message: "Updated partitioning proposal with retention tier options.",
  },
  {
    type: "escalation",
    author: "COO",
    authorName: "Nova",
    ...MISSIONS[3],
    message: "Escalated blocker: scope alignment needed before specification continues.",
  },
  {
    type: "implementation",
    author: "Engineer",
    authorName: "Flux",
    ...MISSIONS[0],
    message: "Pushed session refresh middleware — ready for review.",
  },
  {
    type: "coordination",
    author: "COO",
    authorName: "Nova",
    ...MISSIONS[1],
    message: "Synchronized team priorities for analytics architecture decision.",
  },
  {
    type: "task_assignment",
    author: "COO",
    authorName: "Nova",
    ...MISSIONS[0],
    message: "Assigned Engineer to complete auth critical path items.",
  },
];

export function pickRandomFeedTemplate(): FeedTemplate {
  return LIVE_FEED_TEMPLATES[Math.floor(Math.random() * LIVE_FEED_TEMPLATES.length)];
}

export function randomLiveIntervalMs(): number {
  return 20_000 + Math.floor(Math.random() * 20_000);
}
