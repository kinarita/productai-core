import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { runtimeStoreInitial } from "@/lib/store/initialState";
import type { RuntimeCost } from "@/types/productai";
import type { RuntimeEventTemplate } from "@/lib/store/runtimeEventTemplates";

export interface RuntimeAlert {
  id: string;
  severity: "info" | "warning" | "danger";
  message: string;
  timestamp: string;
}

export interface ProviderHealth {
  provider: string;
  health: RuntimeCost["health"];
}

export interface ProviderCostRow {
  provider: string;
  tokensUsed: number;
  costUsd: number;
  trend: RuntimeCost["trend"];
}

interface RuntimeState {
  providerHealth: ProviderHealth[];
  providerCosts: ProviderCostRow[];
  tokenUsage: number;
  totalCostUsd: number;
  projectedMonthlyUsd: number;
  budgetUsd: number;
  alerts: RuntimeAlert[];
  updateProviderHealth: (provider: string, health: RuntimeCost["health"]) => void;
  addAlert: (alert: Omit<RuntimeAlert, "id">) => void;
  applyRuntimeEvent: (event: RuntimeEventTemplate) => void;
  resetToInitial: () => void;
}

function nowTimestamp() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const useRuntimeStore = create<RuntimeState>()(
  persist(
    (set, get) => ({
      ...runtimeStoreInitial,
      updateProviderHealth: (provider, health) =>
        set((state) => ({
          providerHealth: state.providerHealth.map((p) =>
            p.provider === provider ? { ...p, health } : p
          ),
        })),
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            { ...alert, id: `rt-${Date.now()}`, timestamp: alert.timestamp || nowTimestamp() },
            ...state.alerts,
          ].slice(0, 10),
        })),
      applyRuntimeEvent: (event) => {
        const state = get();
        const exists = state.providerHealth.some((p) => p.provider === event.provider);
        const providerHealth = exists
          ? state.providerHealth.map((p) =>
              p.provider === event.provider ? { ...p, health: event.health } : p
            )
          : [...state.providerHealth, { provider: event.provider, health: event.health }];

        const tokenDelta = event.tokenDelta ?? 0;
        const newTokenUsage = state.tokenUsage + tokenDelta;
        const projectedBump = tokenDelta > 0 ? Math.round(tokenDelta * 0.0003) : 0;

        set({
          providerHealth,
          tokenUsage: newTokenUsage,
          projectedMonthlyUsd: state.projectedMonthlyUsd + projectedBump,
          alerts: [
            {
              id: `rt-${Date.now()}`,
              severity: event.alertSeverity,
              message: event.alertMessage,
              timestamp: nowTimestamp(),
            },
            ...state.alerts,
          ].slice(0, 10),
        });
      },
      resetToInitial: () => set({ ...runtimeStoreInitial }),
    }),
    {
      name: "productai-runtime",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        providerHealth: state.providerHealth,
        providerCosts: state.providerCosts,
        tokenUsage: state.tokenUsage,
        totalCostUsd: state.totalCostUsd,
        projectedMonthlyUsd: state.projectedMonthlyUsd,
        budgetUsd: state.budgetUsd,
        alerts: state.alerts,
      }),
    }
  )
);

export function getOverallApiHealth(
  providers: ProviderHealth[]
): { label: string; variant: "success" | "warning" | "danger" } {
  if (providers.some((p) => p.health === "down")) {
    return { label: "Degraded", variant: "danger" };
  }
  if (providers.some((p) => p.health === "degraded")) {
    return { label: "Mixed", variant: "warning" };
  }
  return { label: "Healthy", variant: "success" };
}
