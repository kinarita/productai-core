import { create } from "zustand";
import { runtimeCosts, runtimeSummary } from "@/data/mockData";
import type { RuntimeCost } from "@/types/productai";

export interface RuntimeAlert {
  id: string;
  severity: "info" | "warning" | "danger";
  message: string;
  timestamp: string;
}

interface ProviderHealth {
  provider: string;
  health: RuntimeCost["health"];
}

interface RuntimeState {
  providerHealth: ProviderHealth[];
  tokenUsage: number;
  projectedMonthlyUsd: number;
  budgetUsd: number;
  alerts: RuntimeAlert[];
  updateProviderHealth: (provider: string, health: RuntimeCost["health"]) => void;
  addAlert: (alert: Omit<RuntimeAlert, "id">) => void;
}

const initialAlerts: RuntimeAlert[] = [
  {
    id: "rt-1",
    severity: "info",
    message: "Token usage within expected range for current sprint",
    timestamp: "Just now",
  },
];

export const useRuntimeStore = create<RuntimeState>((set) => ({
  providerHealth: runtimeCosts.map((c) => ({
    provider: c.provider,
    health: c.health,
  })),
  tokenUsage: runtimeSummary.totalTokens,
  projectedMonthlyUsd: runtimeSummary.projectedMonthlyUsd,
  budgetUsd: runtimeSummary.budgetUsd,
  alerts: initialAlerts,
  updateProviderHealth: (provider, health) =>
    set((state) => ({
      providerHealth: state.providerHealth.map((p) =>
        p.provider === provider ? { ...p, health } : p
      ),
    })),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: `rt-${Date.now()}`,
        },
        ...state.alerts,
      ].slice(0, 8),
    })),
}));
