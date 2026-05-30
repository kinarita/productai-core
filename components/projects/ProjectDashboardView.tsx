"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ProjectCreationHero } from "@/components/projects/ProjectCreationHero";
import { ProjectCreationWizard } from "@/components/projects/ProjectCreationWizard";
import { ShouldWeBuildCard } from "@/components/projects/ShouldWeBuildCard";
import { buildProjectDashboardCards } from "@/lib/agent-first/workerAnalysis";
import { useMissionStore } from "@/lib/store/missionStore";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";
import { useShallow } from "zustand/react/shallow";
import { useTaskStore } from "@/lib/store/taskStore";
import { releases } from "@/data/mockData";
import type { DiscoveryMode } from "@/lib/project-creation/projectCreationTypes";
import { recommendDiscoveryMode } from "@/lib/project-creation/discoveryModeLabels";
import { cn } from "@/lib/utils";

export function ProjectDashboardView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const [heroIdea, setHeroIdea] = useState("");
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>("quick");
  const [discoveryModeManuallySet, setDiscoveryModeManuallySet] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const cards = buildProjectDashboardCards({ missions, tasks, releases });
  const featured = cards[0];
  const featuredMissionId = featured?.missionId;
  const featuredPlannerRun = useAgentRunsStore(
    useShallow((s) => (featuredMissionId ? s.getPlannerRun(featuredMissionId) : undefined))
  );

  return (
    <AppShell
      title="Projects"
      description="Start building with your AI team in minutes"
    >
      <div className="space-y-8">
        <ProjectCreationHero
          idea={heroIdea}
          onIdeaChange={(value) => {
            setHeroIdea(value);
            if (!value.trim()) {
              setDiscoveryModeManuallySet(false);
            }
            if (!wizardOpen && !discoveryModeManuallySet) {
              setDiscoveryMode(recommendDiscoveryMode(value));
            }
          }}
          discoveryMode={discoveryMode}
          onDiscoveryModeChange={(mode) => {
            setDiscoveryMode(mode);
            setDiscoveryModeManuallySet(true);
          }}
          onStart={() => setWizardOpen(true)}
        />

        <ProjectCreationWizard
          initialIdea={heroIdea}
          initialDiscoveryMode={discoveryMode}
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
        />

        {featured ? (
          <Card
            title={featured.missionName}
            description={
              <span>
                Current stage: <strong className="text-foreground">{featured.currentStage}</strong>
                {" · "}
                {featured.completionPercent}% complete
              </span>
            }
          >
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-xs text-muted">
                  <span>Idea → Release</span>
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
                <ShouldWeBuildCard
                  missionId={featured.missionId}
                  run={featuredPlannerRun}
                />
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium uppercase text-muted">AI workers</p>
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
                  href={`/projects/${featured.missionId}`}
                  className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                >
                  Open project
                </Link>
                <Link
                  href={`/ai-team?mission=${featured.missionId}`}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-accent hover:bg-surface"
                >
                  AI Team
                </Link>
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
              </div>
            </div>
          </Card>
        ) : null}

        {cards.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              All projects
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
                      href={`/projects/${card.missionId}`}
                      className="text-xs font-medium text-accent hover:underline"
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
