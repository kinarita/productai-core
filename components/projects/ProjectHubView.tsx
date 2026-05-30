"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";
import { ProjectActivityFeed } from "@/components/projects/ProjectActivityFeed";
import { buildAiWorkerStatusesForMission } from "@/lib/agent-first/workerAnalysis";
import { buildProjectTimeline } from "@/lib/project-creation/projectTimeline";
import { useMissionStore } from "@/lib/store/missionStore";
import { useProjectCreationStore } from "@/lib/store/projectCreationStore";
import { releases } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

export function ProjectHubView({ missionId }: { missionId: string }) {
  const mission = useMissionStore((s) => s.missions.find((m) => m.id === missionId));
  const meta = useProjectCreationStore((s) => s.getMetaForMission(missionId));
  const activities = useProjectCreationStore((s) => s.getActivitiesForMission(missionId));

  if (!mission) {
    return (
      <AppShell title="Project not found">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to Projects
        </Link>
      </AppShell>
    );
  }

  const timeline = buildProjectTimeline({ mission, releases });
  const workers = buildAiWorkerStatusesForMission(mission);
  const planner = workers.find((w) => w.worker.id === "product_planner");

  return (
    <AppShell
      title={mission.name}
      description={mission.summary}
    >
      <div className="space-y-8">
        <ProjectTimeline stages={timeline} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="AI Team">
            <div className="space-y-3">
              {planner ? (
                <div className="rounded-lg border border-accent/20 bg-indigo-50/40 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {planner.worker.emoji} {planner.worker.title} — {planner.statusLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {meta?.productBriefGenerated
                      ? "Initial Product Brief generated — open Knowledge & Reviews when ready."
                      : "Planning in progress."}
                  </p>
                </div>
              ) : null}
              <ul className="space-y-2 text-sm text-muted">
                {workers.map((w) => (
                  <li key={w.worker.id} className="flex justify-between gap-2">
                    <span>
                      {w.worker.emoji} {w.worker.title}
                    </span>
                    <span className="text-foreground">{w.statusLabel}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={`/ai-team?mission=${missionId}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              View AI Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card title="Product Brief preview">
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 text-xs text-muted">
              {mission.requirementsSummary.slice(0, 1200)}
              {mission.requirementsSummary.length > 1200 ? "…" : ""}
            </pre>
            <Link
              href={`/product-brief?mission=${missionId}`}
              className="mt-3 inline-block text-xs text-accent hover:underline"
            >
              Open full brief workspace
            </Link>
          </Card>
        </div>

        <Card title="Activity">
          <ProjectActivityFeed items={activities} />
        </Card>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/review-workspace"
            className="rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-surface"
          >
            Reviews
          </Link>
          <Link
            href="/releases"
            className="rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-surface"
          >
            Releases
          </Link>
          <Link href="/" className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-surface">
            All projects
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
