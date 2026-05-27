import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { agents } from "@/data/mockData";
import {
  executiveSyncInitial,
  organizationStoreInitial,
} from "@/lib/store/initialState";
import { createFeedItem } from "@/lib/services/feedService";
import { updateDecisionStatus as updateDecisionStatusRemoteService } from "@/lib/services/judgmentService";
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

interface OrganizationState {
  organizationFeedItems: OrganizationFeedItem[];
  activeAgents: Agent[];
  decisions: Decision[];
  executiveSyncState: ExecutiveSyncState;
  addFeedItem: (item: Omit<OrganizationFeedItem, "id" | "timestamp">) => void;
  updateFeedItem: (id: string, patch: Partial<OrganizationFeedItem>) => void;
  updateDecisionStatus: (id: string, status: DecisionStatus) => void;
  linkDecisionToTask: (decisionId: string, taskId: string) => void;
  addFeedRemote: (input: {
    missionId: string;
    taskId?: string | null;
    decisionId?: string | null;
    type: string;
    status?: string | null;
    message: string;
    author?: string;
    authorName?: string;
  }) => Promise<void>;
  updateDecisionStatusRemote: (decisionId: string, patch: { status: string; selectedOption?: string | null; updatedAt?: string }) => Promise<void>;
  setExecutiveSyncState: (state: Partial<ExecutiveSyncState>) => void;
  rotateDiscussionStatus: () => void;
  resetToInitial: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      organizationFeedItems: organizationStoreInitial.organizationFeedItems,
      activeAgents: agents,
      decisions: organizationStoreInitial.decisions,
      executiveSyncState: executiveSyncInitial,
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
      linkDecisionToTask: (decisionId, taskId) =>
        set((state) => ({
          decisions: state.decisions.map((d) => {
            if (d.id !== decisionId) return d;
            const existing = d.relatedTaskIds ?? [];
            if (existing.includes(taskId)) return d;
            return { ...d, relatedTaskIds: [...existing, taskId] };
          }),
        })),
      addFeedRemote: async (input) => {
        await createFeedItem(input);
      },
      updateDecisionStatusRemote: async (decisionId, patch) => {
        await updateDecisionStatusRemoteService(decisionId, patch);
      },
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
              status:
                statuses[(Math.floor(Math.random() * statuses.length) + i) % statuses.length],
            })),
          },
        }));
      },
      resetToInitial: () =>
        set({
          organizationFeedItems: organizationStoreInitial.organizationFeedItems,
          decisions: organizationStoreInitial.decisions,
          activeAgents: agents,
          executiveSyncState: executiveSyncInitial,
        }),
    }),
    {
      name: "productai-organization",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        organizationFeedItems: state.organizationFeedItems,
        decisions: state.decisions,
      }),
    }
  )
);

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
