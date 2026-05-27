"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { AgentAvatar } from "@/components/AgentAvatar";
import { MissionLink } from "@/components/MissionLink";
import { useLiveExecutiveSync } from "@/lib/hooks/useLiveExecutiveSync";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { Gavel } from "lucide-react";

export function ExecutiveSyncView() {
  useLiveExecutiveSync(true);

  const ctx = useOrganizationStore((s) => s.executiveSyncState);

  return (
    <AppShell
      title="Executive Sync"
      description="Strategic collaboration between CEO and AI leadership"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title={ctx.topic}
            description={
              <span className="inline-flex flex-wrap items-center gap-1">
                Mission:{" "}
                <MissionLink missionId={ctx.missionId} missionName={ctx.mission} variant="link" />
              </span>
            }
          >
            <div className="space-y-6">
              {ctx.isLive && (
                <div className="rounded-lg border border-border bg-surface px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                    </span>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Active discussion
                    </p>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {ctx.discussionStatus.map((s) => (
                      <li key={s.role} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {s.name}{" "}
                          <span className="text-muted">({s.role})</span>
                        </span>
                        <span className="text-xs text-muted">{s.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  Active Participants
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                      AC
                    </div>
                    <div>
                      <p className="text-sm font-medium">Alex Chen</p>
                      <p className="text-xs text-muted">CEO</p>
                    </div>
                  </div>
                  {ctx.participants.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <AgentAvatar role={p.role} name={p.name} showStatus status={p.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  AI Opinions
                </p>
                <ul className="space-y-3">
                  {ctx.aiOpinions.map((op) => (
                    <li
                      key={op.role}
                      className="rounded-lg border border-border bg-surface p-4"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {op.name}{" "}
                        <span className="font-normal text-muted">({op.role})</span>
                      </p>
                      <p className="mt-1 text-sm text-muted">{op.opinion}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-accent/20 bg-indigo-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  Recommendation
                </p>
                <p className="mt-2 text-sm text-foreground">{ctx.recommendation}</p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Gavel className="h-4 w-4" />
                Make Decision
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Context">
            <ul className="space-y-2">
              {ctx.context.map((line, i) => (
                <li key={i} className="text-sm text-muted">
                  · {line}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Tradeoff Comparison">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="pb-2 pr-4 font-medium">Dimension</th>
                    <th className="pb-2 pr-4 font-medium">Option A</th>
                    <th className="pb-2 font-medium">Option B</th>
                  </tr>
                </thead>
                <tbody>
                  {ctx.tradeoffs.map((row) => (
                    <tr key={row.dimension} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-foreground">{row.dimension}</td>
                      <td className="py-2 pr-4 text-muted">{row.optionA}</td>
                      <td className="py-2 font-medium text-accent">{row.optionB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
