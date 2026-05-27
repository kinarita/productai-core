"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, StatCard } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getPersistenceMode } from "@/lib/config/persistenceMode";
import { buildOrchestrationContext } from "@/lib/orchestration/contextBuilder";
import { getProductAIOrchestrator } from "@/lib/orchestration/orchestrator";
import { getOverallApiHealth, useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import {
  formatBackendHealthLabel,
  getSuggestedRetryLabel,
} from "@/lib/services/syncPolicyUi";
import { runtimeCosts } from "@/data/mockData";

export function RuntimeCostView() {
  const [runtimeInsight, setRuntimeInsight] = useState<string | null>(null);
  const providerHealth = useRuntimeStore((s) => s.providerHealth);
  const tokenUsage = useRuntimeStore((s) => s.tokenUsage);
  const totalCostUsd = useRuntimeStore((s) => s.totalCostUsd);
  const projectedMonthlyUsd = useRuntimeStore((s) => s.projectedMonthlyUsd);
  const budgetUsd = useRuntimeStore((s) => s.budgetUsd);
  const alerts = useRuntimeStore((s) => s.alerts);
  const hydrationStatus = useSyncStore((s) => s.hydrationStatus);
  const lastHydratedAt = useSyncStore((s) => s.lastHydratedAt);
  const lastSuccessfulReadAt = useSyncStore((s) => s.lastSuccessfulReadAt);
  const lastSuccessfulWriteAt = useSyncStore((s) => s.lastSuccessfulWriteAt);
  const pendingHydrationCount = useSyncStore((s) => s.pendingHydrationCount);
  const backendHealth = useSyncStore((s) => s.backendHealth);
  const readFailures = useSyncStore((s) => s.readFailures);
  const writeFailures = useSyncStore((s) => s.writeFailures);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);

  const apiHealth = getOverallApiHealth(providerHealth);
  const budgetUsed = Math.round((totalCostUsd / budgetUsd) * 100);

  const rows = runtimeCosts.map((mock) => {
    const live = providerHealth.find((p) => p.provider === mock.provider);
    return { ...mock, health: live?.health ?? mock.health };
  });

  const gemini = providerHealth.find((p) => p.provider === "Google Gemini");
  const persistenceMode = getPersistenceMode();
  const backendLabel = formatBackendHealthLabel(backendHealth);
  const retryLabel = getSuggestedRetryLabel(pendingHydrationCount);
  const healthBadgeVariant =
    hydrationStatus === "failed" || backendHealth === "unavailable"
      ? "warning"
      : "success";

  const generateRuntimeInsight = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const insight = await orchestrator.generateRuntimeObserverInsight(context);
    setRuntimeInsight(insight);
  };

  return (
    <AppShell
      title="Runtime & Cost"
      description="AI operational cost observability and provider health"
    >
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Token Usage (MTD)"
            value={`${(tokenUsage / 1_000_000).toFixed(1)}M`}
            subtext="Across all providers"
          />
          <StatCard
            label="Provider Costs (MTD)"
            value={`$${totalCostUsd.toFixed(0)}`}
            subtext={`${budgetUsed}% of budget`}
          />
          <StatCard
            label="Projected Monthly"
            value={`$${projectedMonthlyUsd}`}
            subtext={`Budget: $${budgetUsd}`}
            trend={projectedMonthlyUsd > budgetUsd * 0.9 ? "up" : "neutral"}
          />
          <StatCard
            label="API Health"
            value={apiHealth.label}
            subtext="Live provider status"
          />
        </div>

        {alerts.length > 0 && (
          <Card title="Operational Alerts">
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="mt-0.5 text-xs text-muted">{alert.timestamp}</p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "danger"
                        ? "danger"
                        : alert.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Provider Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Tokens</th>
                  <th className="pb-3 font-medium">Cost (USD)</th>
                  <th className="pb-3 font-medium">Trend</th>
                  <th className="pb-3 font-medium">Health</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.provider} className="border-b border-border last:border-0">
                    <td className="py-4 font-medium text-foreground">{row.provider}</td>
                    <td className="py-4 text-muted">{row.tokensUsed.toLocaleString()}</td>
                    <td className="py-4 text-foreground">${row.costUsd.toFixed(2)}</td>
                    <td className="py-4">
                      <Badge
                        variant={
                          row.trend === "up"
                            ? "warning"
                            : row.trend === "down"
                              ? "success"
                              : "muted"
                        }
                      >
                        {row.trend}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          row.health === "healthy"
                            ? "success"
                            : row.health === "degraded"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {row.health}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {gemini && (
                  <tr className="border-b border-border last:border-0">
                    <td className="py-4 font-medium text-foreground">Google Gemini</td>
                    <td className="py-4 text-muted">—</td>
                    <td className="py-4 text-muted">—</td>
                    <td className="py-4">
                      <Badge variant="muted">stable</Badge>
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          gemini.health === "healthy"
                            ? "success"
                            : gemini.health === "degraded"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {gemini.health}
                      </Badge>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Budget Projection">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Current spend</span>
              <span className="font-medium">${totalCostUsd.toFixed(2)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${Math.min(100, (projectedMonthlyUsd / budgetUsd) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted">
              Projected ${projectedMonthlyUsd} of ${budgetUsd} monthly budget
            </p>
          </div>
        </Card>

        <Card title="Sync Health">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={healthBadgeVariant}>Operational sync</Badge>
              <span className="text-xs text-muted">{retryLabel}</span>
            </div>
            <p className="text-muted">
              Persistence mode: <span className="text-foreground">{persistenceMode}</span>
            </p>
            <p className="text-muted">
              Backend health: <span className="text-foreground">{backendLabel}</span>
            </p>
            <p className="text-muted">
              Hydration status: <span className="text-foreground">{hydrationStatus}</span>
            </p>
            <p className="text-muted">
              Last hydrated: <span className="text-foreground">{lastHydratedAt ?? "Not yet"}</span>
            </p>
            <p className="text-muted">
              Last successful read/write:{" "}
              <span className="text-foreground">
                {lastSuccessfulReadAt ?? "N/A"} / {lastSuccessfulWriteAt ?? "N/A"}
              </span>
            </p>
            <p className="text-muted">
              Pending retries: <span className="text-foreground">{pendingHydrationCount}</span>
            </p>
          </div>
          {(readFailures.length > 0 || writeFailures.length > 0) && (
            <ul className="mt-3 space-y-2">
              {[...readFailures, ...writeFailures].slice(0, 4).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted"
                >
                  <span className="font-medium text-foreground">{entry.label}</span>
                  {" · "}
                  Backend synchronization delayed — local continuity maintained.
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Runtime Observer Insight">
          {runtimeInsight ? (
            <p className="text-sm text-foreground">{runtimeInsight}</p>
          ) : (
            <p className="text-sm text-muted">
              Generate a concise operational insight from Runtime Observer.
            </p>
          )}
          <button
            type="button"
            onClick={() => void generateRuntimeInsight()}
            className="mt-3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Generate Runtime Insight
          </button>
        </Card>

        <Card title="Sync Warnings">
          {syncWarnings.length > 0 ? (
            <ul className="space-y-2">
              {syncWarnings.slice(0, 6).map((warning) => (
                <li
                  key={warning.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted"
                >
                  <span className="font-medium text-foreground">{warning.message}</span>
                  {(warning.count ?? 1) > 1 ? (
                    <span className="ml-2 text-muted">×{warning.count}</span>
                  ) : null}
                  <span className="ml-2 text-muted">
                    · last {warning.lastSeenAt ?? warning.createdAt}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">
              No active sync advisories. Local execution continuity is maintained.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
