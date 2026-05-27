import { create } from "zustand";
import {
  agents,
  decisions as initialDecisions,
  executiveSyncContext,
  organizationFeedItems as initialFeed,
} from "@/data/mockData";
import type {
  Agent,
  AgentRole,
  Decision,
  DecisionStatus,
  OrganizationFeedItem,
} from "@/types/productai";

export interface AgentDiscussionStatus {
  role: AgentRole;
  name: string;
  status: string;
}

export interface ExecutiveSyncState {
  topic: string;
  mission: string;
  missionId: string;
  participants: Agent[];
  context: string[];
  aiOpinions: { role: AgentRole; name: string; opinion: string }[];
  tradeoffs: { dimension: string; optionA: string; optionB: string }[];
  recommendation: string;
  discussionStatus: AgentDiscussionStatus[];
  isLive: boolean;
}

const initialDiscussionStatus: AgentDiscussionStatus[] = [
  { role: "Architect", name: "Sage", status: "Analyzing partitioning proposal…" },
  { role: "QA", name: "Lens", status: "Reviewing regression results…" },
  { role: "COO", name: "Nova", status: "Preparing recommendation…" },
  { role: "Engineer", name: "Flux", status: "Estimating implementation impact…" },
];

interface OrganizationState {
  organizationFeedItems: OrganizationFeedItem[];
  activeAgents: Agent[];
  decisions: Decision[];
  executiveSyncState: ExecutiveSyncState;
  addFeedItem: (item: Omit<OrganizationFeedItem, "id" | "timestamp">) => void;
  updateFeedItem: (id: string, patch: Partial<OrganizationFeedItem>) => void;
  updateDecisionStatus: (id: string, status: DecisionStatus) => void;
  setExecutiveSyncState: (state: Partial<ExecutiveSyncState>) => void;
  rotateDiscussionStatus: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizationFeedItems: initialFeed,
  activeAgents: agents,
  decisions: initialDecisions,
  executiveSyncState: {
    topic: executiveSyncContext.topic,
    mission: executiveSyncContext.mission,
    missionId: "m-2",
    participants: executiveSyncContext.participants,
    context: executiveSyncContext.context,
    aiOpinions: executiveSyncContext.aiOpinions,
    tradeoffs: executiveSyncContext.tradeoffs,
    recommendation: executiveSyncContext.recommendation,
    discussionStatus: initialDiscussionStatus,
    isLive: true,
  },
  addFeedItem: (item) =>
    set((state) => ({
      organizationFeedItems: [
        {
          ...item,
          id: `f-live-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
        ...state.organizationFeedItems,
      ],
    })),
  updateFeedItem: (id, patch) =>
    set((state) => ({
      organizationFeedItems: state.organizationFeedItems.map((f) =>
        f.id === id ? { ...f, ...patch } : f
      ),
    })),
  updateDecisionStatus: (id, status) =>
    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === id ? { ...d, status } : d)),
    })),
  setExecutiveSyncState: (patch) =>
    set((state) => ({
      executiveSyncState: { ...state.executiveSyncState, ...patch },
    })),
  rotateDiscussionStatus: () => {
    const statuses = [
      "Analyzing proposal…",
      "Reviewing regression results…",
      "Preparing recommendation…",
      "Updating architecture notes…",
      "Cross-checking cost impact…",
    ];
    set((state) => ({
      executiveSyncState: {
        ...state.executiveSyncState,
        discussionStatus: state.executiveSyncState.discussionStatus.map((s, i) => ({
          ...s,
          status: statuses[(Math.floor(Math.random() * statuses.length) + i) % statuses.length],
        })),
      },
    }));
  },
}));

export function resolveDecisionActionMessage(
  decision: Decision,
  action: "approved" | "rejected" | "revision"
): string {
  const mission = decision.missionName;
  const title = decision.title;
  if (action === "approved") {
    return `CEO approved "${title}" for ${mission}.`;
  }
  if (action === "rejected") {
    return `CEO rejected "${title}" for ${mission}.`;
  }
  return `CEO requested revision on "${title}" for ${mission}.`;
}
