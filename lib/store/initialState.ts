import {
  agents,
  decisions as initialDecisions,
  executiveSyncContext,
  missions as initialMissions,
  organizationFeedItems as initialFeed,
  runtimeCosts,
  runtimeSummary,
  tasks as initialTasks,
} from "@/data/mockData";
import type { RuntimeAlert } from "@/lib/store/runtimeStore";
import type { AgentRole } from "@/types/productai";

const initialDiscussionStatus: { role: AgentRole; name: string; status: string }[] = [
  { role: "Architect", name: "Sage", status: "Analyzing partitioning proposal…" },
  { role: "QA", name: "Lens", status: "Reviewing regression results…" },
  { role: "COO", name: "Nova", status: "Preparing recommendation…" },
  { role: "Engineer", name: "Flux", status: "Estimating implementation impact…" },
];

export const missionStoreInitial = {
  missions: initialMissions,
  selectedMissionId: null as string | null,
};

export const organizationStoreInitial = {
  organizationFeedItems: initialFeed,
  decisions: initialDecisions,
};

export const executiveSyncInitial = {
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
};

const initialRuntimeAlerts: RuntimeAlert[] = [
  {
    id: "rt-1",
    severity: "info",
    message: "Token usage within expected range for current sprint",
    timestamp: "Just now",
  },
];

export const runtimeStoreInitial = {
  providerHealth: [
    ...runtimeCosts.map((c) => ({
      provider: c.provider,
      health: c.health as "healthy" | "degraded" | "down",
    })),
    { provider: "Google Gemini", health: "healthy" as const },
  ],
  providerCosts: runtimeCosts.map((c) => ({
    provider: c.provider,
    tokensUsed: c.tokensUsed,
    costUsd: c.costUsd,
    trend: c.trend,
  })),
  tokenUsage: runtimeSummary.totalTokens,
  totalCostUsd: runtimeSummary.totalCostUsd,
  projectedMonthlyUsd: runtimeSummary.projectedMonthlyUsd,
  budgetUsd: runtimeSummary.budgetUsd,
  alerts: initialRuntimeAlerts,
};

export const uiStoreInitial = {
  sidebarCollapsed: false,
  activeMissionId: null as string | null,
  selectedDecisionId: null as string | null,
  activeFeedFilter: "all" as const,
};

export const taskStoreInitial = {
  tasks: initialTasks,
};

export const PERSIST_KEYS = [
  "productai-ui",
  "productai-missions",
  "productai-organization",
  "productai-runtime",
  "productai-tasks",
] as const;
