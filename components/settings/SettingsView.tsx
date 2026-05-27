"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { organizationSettings } from "@/data/mockData";
import { getPersistenceMode } from "@/lib/config/persistenceMode";
import { refreshBackendHealth } from "@/lib/services/backendHealth";
import { hydrateProductAIState, runSyncRetry } from "@/lib/services/readHydrationService";
import { useSyncStore } from "@/lib/store/syncStore";
import { resetAllProductAIState } from "@/lib/store/resetProductAIState";
import { useState } from "react";

export function SettingsView() {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const s = organizationSettings;
  const persistenceMode = getPersistenceMode();
  const hydrationStatus = useSyncStore((state) => state.hydrationStatus);
  const lastHydratedAt = useSyncStore((state) => state.lastHydratedAt);
  const lastSuccessfulWriteAt = useSyncStore((state) => state.lastSuccessfulWriteAt);
  const pendingHydrationCount = useSyncStore((state) => state.pendingHydrationCount);
  const backendHealth = useSyncStore((state) => state.backendHealth);
  const clearSyncLog = useSyncStore((state) => state.clearSyncLog);
  const clearWarnings = useSyncStore((state) => state.clearWarnings);

  const runManualAction = async (action: "refresh" | "hydrate" | "retry") => {
    setRunningAction(action);
    try {
      if (action === "refresh") {
        await refreshBackendHealth();
        await hydrateProductAIState();
      } else if (action === "hydrate") {
        await hydrateProductAIState();
      } else {
        await runSyncRetry();
      }
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <AppShell
      title="Settings"
      description="Organization configuration, AI providers, and operational controls"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <Card title="Organization">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase text-muted">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue={s.organizationName}
                readOnly
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase text-muted">CEO Name</label>
              <input
                type="text"
                defaultValue={s.ceoName}
                readOnly
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        </Card>

        <Card title="AI Providers">
          <ul className="space-y-2">
            {s.aiProviders.map((provider) => (
              <li
                key={provider}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <span className="text-sm text-foreground">{provider}</span>
                <span className="text-xs text-success">Connected</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Budget Controls">
          <div>
            <label className="text-xs font-medium uppercase text-muted">
              Monthly Budget (USD)
            </label>
            <input
              type="number"
              defaultValue={s.monthlyBudgetUsd}
              readOnly
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
            />
            <p className="mt-2 text-xs text-muted">
              Alerts trigger at 80% and 95% of monthly budget.
            </p>
          </div>
        </Card>

        <Card title="Notifications">
          <ul className="space-y-3">
            {Object.entries(s.notifications).map(([key, enabled]) => (
              <li
                key={key}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <span className="text-sm capitalize text-foreground">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span
                  className={`text-xs font-medium ${enabled ? "text-success" : "text-muted"}`}
                >
                  {enabled ? "On" : "Off"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Local Data">
          <p className="text-sm text-muted">
            ProductAI stores mission, organization, and runtime state in your browser.
            Reset to restore the initial demo dataset.
          </p>
          <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
            <p>Persistence mode: {persistenceMode}</p>
            <p className="mt-1">Backend sync: operational</p>
            <p className="mt-1">Backend health: {backendHealth}</p>
            <p className="mt-1">Hydration status: {hydrationStatus}</p>
            <p className="mt-1">Last hydration: {lastHydratedAt ?? "Not yet"}</p>
            <p className="mt-1">Last successful write: {lastSuccessfulWriteAt ?? "Not yet"}</p>
            <p className="mt-1">Pending retries: {pendingHydrationCount}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => clearSyncLog()}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              Clear sync log
            </button>
            <button
              type="button"
              onClick={() => clearWarnings()}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              Clear warnings
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runManualAction("refresh")}
              disabled={runningAction !== null}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh from backend
            </button>
            <button
              type="button"
              onClick={() => void runManualAction("hydrate")}
              disabled={runningAction !== null}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Run hydration
            </button>
            <button
              type="button"
              onClick={() => void runManualAction("retry")}
              disabled={runningAction !== null}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retry sync
            </button>
          </div>
          <button
            type="button"
            onClick={() => resetAllProductAIState()}
            className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            Reset Local State
          </button>
        </Card>
      </div>
    </AppShell>
  );
}
