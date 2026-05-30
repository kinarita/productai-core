"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { agentFirstAdvisoryNote } from "@/lib/agent-first/agentFirstNav";
import { buildProjectDashboardCards } from "@/lib/agent-first/workerAnalysis";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { releases } from "@/data/mockData";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectDashboardView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);

  const cards = buildProjectDashboardCards({ missions, tasks, releases });
  const featured = cards[0];

  return (
    <AppShell
      title="Projects"
      description="What your AI team is building—progress, reviews, and deliverables in one place"
    >
      <div className="space-y-8">
        <div className="rounded-lg border border-accent/20 bg-indigo-50/40 px-4 py-3 text-sm text-foreground">
          <p className="font-medium">何を作りたいですか？</p>
          <p className="mt-1 text-muted">{agentFirstAdvisoryNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/idea-workspace"
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              新しいプロジェクトを始める
            </Link>
            <Link
              href="/ai-team"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
            >
              AI Team を見る
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {featured ? (
          <Card
            title={featured.missionName}
            description={
              <span>
                現在のステージ: <strong className="text-foreground">{featured.currentStage}</strong>
                {" · "}
                完了率 {featured.completionPercent}%
              </span>
            }
          >
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-xs text-muted">
                  <span>Planning → Release</span>
                  <span>{featured.completionPercent}%</span>
                </div>
                <div className="flex gap-1">
                  {featured.stageProgress.map((stage) => (
                    <div key={stage.label} className="flex-1">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          stage.state === "done"
                            ? "bg-success"
                            : stage.state === "current"
                              ? "bg-accent"
                              : "bg-border"
                        )}
                      />
                      <p
                        className={cn(
                          "mt-1 truncate text-center text-[10px]",
                          stage.state === "current" ? "font-medium text-foreground" : "text-muted"
                        )}
                      >
                        {stage.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium uppercase text-muted">AIワーカー</p>
                  <p className="mt-1 text-sm text-foreground">{featured.workerSummary}</p>
                </div>
                <Link
                  href="/review-workspace"
                  className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-surface/80"
                >
                  <p className="text-xs font-medium uppercase text-muted">Latest review</p>
                  <p className="mt-1 text-sm text-foreground">{featured.latestReview}</p>
                </Link>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium uppercase text-muted">Latest deliverable</p>
                  <p className="mt-1 text-sm text-foreground">{featured.latestArtifact}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/ai-team?mission=${featured.missionId}`}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-accent hover:bg-surface"
                >
                  AI Team
                </Link>
                <Link
                  href="/review-workspace"
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface"
                >
                  Reviews
                </Link>
                <Link
                  href="/releases"
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface"
                >
                  Releases
                </Link>
                <Link
                  href={`/artifact-lineage?mission=${featured.missionId}`}
                  className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-surface"
                >
                  Decision Trail
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card title="プロジェクトがありません">
            <p className="text-sm text-muted">
              最初のプロジェクトを作成して、AIチームに仕事を依頼しましょう。
            </p>
          </Card>
        )}

        {cards.length > 1 ? (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              すべてのプロジェクト
            </p>
            <ul className="space-y-3">
              {cards.map((card) => (
                <li
                  key={card.missionId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{card.missionName}</p>
                    <p className="text-xs text-muted">
                      {card.currentStage} · {card.completionPercent}% · {card.activeWorkerTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{card.currentStage}</Badge>
                    <Link
                      href={`/ai-team?mission=${card.missionId}`}
                      className="text-xs text-accent hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
