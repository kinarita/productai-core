"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { organizationSettings } from "@/data/mockData";
import { resetAllProductAIState } from "@/lib/store/resetProductAIState";

export function SettingsView() {
  const s = organizationSettings;

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
