"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { organizationSettings } from "@/data/mockData";
import { getPersistenceMode } from "@/lib/config/persistenceMode";
import { refreshBackendHealth } from "@/lib/services/backendHealth";
import { hydrateProductAIState, runSyncRetry } from "@/lib/services/readHydrationService";
import {
  fetchReplaySeedDiagnostics,
  refreshDecisionAttentionSeeds,
} from "@/lib/services/replaySeedRefresh";
import {
  formatBackendHealthLabel,
  getRemoteModeExplanation,
  getSuggestedRetryLabel,
} from "@/lib/services/syncPolicyUi";
import { useSyncStore } from "@/lib/store/syncStore";
import { resetAllProductAIState } from "@/lib/store/resetProductAIState";

export function SettingsView() {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [replaySeedMessage, setReplaySeedMessage] = useState<string | null>(null);
  const [replaySeedStatus, setReplaySeedStatus] = useState<string | null>(null);
  const s = organizationSettings;
  const persistenceMode = getPersistenceMode();
  const hydrationStatus = useSyncStore((state) => state.hydrationStatus);
  const lastHydratedAt = useSyncStore((state) => state.lastHydratedAt);
  const lastSuccessfulWriteAt = useSyncStore((state) => state.lastSuccessfulWriteAt);
  const lastSuccessfulReadAt = useSyncStore((state) => state.lastSuccessfulReadAt);
  const pendingHydrationCount = useSyncStore((state) => state.pendingHydrationCount);
  const backendHealth = useSyncStore((state) => state.backendHealth);
  const syncWarnings = useSyncStore((state) => state.syncWarnings);
  const clearSyncLog = useSyncStore((state) => state.clearSyncLog);
  const clearWarnings = useSyncStore((state) => state.clearWarnings);

  const retryLabel = getSuggestedRetryLabel(pendingHydrationCount);
  const backendLabel = formatBackendHealthLabel(backendHealth);

  const loadReplaySeedStatus = async () => {
    try {
      const diagnostics = await fetchReplaySeedDiagnostics();
      const continuityReady = Object.values(diagnostics.continuityCoverage).every(Boolean);
      setReplaySeedStatus(
        diagnostics.hydrationReady
          ? "Seed status: decision attention seeds available · hydration-ready replay examples available"
          : continuityReady
            ? "Seed status: decision attention seeds available · hydration examples partially available"
            : "Seed status: replay continuity examples may need refresh for full lifecycle coverage"
      );
    } catch {
      setReplaySeedStatus(
        "Seed status: replay continuity examples will be confirmed after backend connection."
      );
    }
  };

  const runReplaySeedRefresh = async () => {
    setRunningAction("replay-seeds");
    setReplaySeedMessage(null);
    try {
      const result = await refreshDecisionAttentionSeeds();
      setReplaySeedMessage(
        result.inserted > 0
          ? `${result.message} (${result.inserted} added, ${result.skipped} already present.)`
          : result.message
      );
      await hydrateProductAIState();
      await loadReplaySeedStatus();
    } catch (error) {
      setReplaySeedMessage(
        error instanceof Error
          ? error.message
          : "Replay seed refresh could not be completed. Retry when backend sync is available."
      );
    } finally {
      setRunningAction(null);
    }
  };

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

        <Card title="Replay Development Seeds">
          <p className="text-sm text-muted">
            Replay continuity examples support governance interpretation during development.
            Refresh adds missing decision attention seeds without overwriting existing records.
          </p>
          {replaySeedStatus ? (
            <p className="mt-3 text-xs text-muted">{replaySeedStatus}</p>
          ) : (
            <p className="mt-3 text-xs text-muted">
              Seed status: decision attention seeds available · hydration-ready replay examples
              available
            </p>
          )}
          {replaySeedMessage ? (
            <p className="mt-2 text-xs text-foreground">{replaySeedMessage}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadReplaySeedStatus()}
              disabled={runningAction !== null || persistenceMode === "local"}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Check seed status
            </button>
            <button
              type="button"
              onClick={() => void runReplaySeedRefresh()}
              disabled={runningAction !== null || persistenceMode === "local"}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh Replay Seeds
            </button>
          </div>
        </Card>

        <Card title="Sync Operations">
          <p className="text-sm text-muted">
            Operational persistence controls for ProductAI hybrid sync.
          </p>
          <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
            <p>
              Persistence: <span className="text-foreground">{persistenceMode}</span>
            </p>
            <p className="mt-1">
              Backend sync: <span className="text-foreground">operational</span>
            </p>
            <p className="mt-1">
              Backend health: <span className="text-foreground">{backendLabel}</span>
            </p>
            <p className="mt-1">
              Last hydration: <span className="text-foreground">{lastHydratedAt ?? "Not yet"}</span>
            </p>
            <p className="mt-1">
              Last read / write:{" "}
              <span className="text-foreground">
                {lastSuccessfulReadAt ?? "N/A"} / {lastSuccessfulWriteAt ?? "N/A"}
              </span>
            </p>
            <p className="mt-1">
              Pending retries: <span className="text-foreground">{pendingHydrationCount}</span>
            </p>
            <p className="mt-1">
              Retry guidance: <span className="text-foreground">{retryLabel}</span>
            </p>
            <p className="mt-1">
              Hydration status: <span className="text-foreground">{hydrationStatus}</span>
            </p>
          </div>
          <p className="mt-3 text-xs text-muted">{getRemoteModeExplanation(persistenceMode)}</p>
          {syncWarnings.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {syncWarnings.slice(0, 4).map((warning) => (
                <li
                  key={warning.id}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted"
                >
                  <span className="text-foreground">{warning.message}</span>
                  {(warning.count ?? 1) > 1 ? (
                    <span className="ml-2 text-muted">×{warning.count}</span>
                  ) : null}
                  <span className="ml-2 text-muted">· last {warning.lastSeenAt ?? warning.createdAt}</span>
                </li>
              ))}
            </ul>
          ) : null}
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
              disabled={runningAction !== null || persistenceMode === "local"}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh from backend
            </button>
            <button
              type="button"
              onClick={() => void runManualAction("hydrate")}
              disabled={runningAction !== null || persistenceMode === "local"}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Run hydration
            </button>
            <button
              type="button"
              onClick={() => void runManualAction("retry")}
              disabled={runningAction !== null || persistenceMode === "local"}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retry sync
            </button>
          </div>
        </Card>

        <Card title="Local Data">
          <p className="text-sm text-muted">
            ProductAI stores mission, organization, and runtime state in your browser.
            Reset to restore the initial demo dataset.
          </p>
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
