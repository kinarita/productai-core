import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitPullRequest } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { AgentAvatar } from "@/components/AgentAvatar";
import { LifecycleStepper } from "@/components/LifecycleStepper";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusPill } from "@/components/StatusPill";
import {
  getActivitiesForMission,
  getBranchesForMission,
  getDecisionsForMission,
  getMemoriesForMission,
  getMissionById,
  getPullRequestsForMission,
  getReleaseForMission,
  getTasksForMission,
} from "@/data/missionHelpers";
import type { MissionHealth, MissionStatus, TaskStatus } from "@/types/productai";

const healthVariant: Record<MissionHealth, "success" | "warning" | "danger"> = {
  stable: "success",
  delayed: "warning",
  risky: "warning",
  blocked: "danger",
};

const statusVariant: Record<MissionStatus, "accent" | "success" | "warning" | "muted"> = {
  planning: "muted",
  active: "accent",
  on_hold: "warning",
  completed: "success",
};

const taskStatusVariant: Record<TaskStatus, "info" | "warning" | "danger" | "success"> = {
  active: "info",
  in_review: "warning",
  blocked: "danger",
  completed: "success",
};

interface MissionDetailPageProps {
  params: Promise<{ missionId: string }>;
}

export default async function MissionDetailPage({ params }: MissionDetailPageProps) {
  const { missionId } = await params;
  const mission = getMissionById(missionId);

  if (!mission) {
    notFound();
  }

  const missionTasks = getTasksForMission(mission);
  const activeTasks = missionTasks.filter((t) => t.status !== "completed");
  const pendingDecisions = getDecisionsForMission(mission).filter((d) => d.status === "pending");
  const relatedBranches = getBranchesForMission(mission);
  const relatedPrs = getPullRequestsForMission(mission);
  const memoryInsights = getMemoriesForMission(mission);
  const activities = getActivitiesForMission(mission);
  const release = getReleaseForMission(mission);

  const hasPendingDecisions = pendingDecisions.length > 0;
  const hasCode = relatedBranches.length > 0 || relatedPrs.length > 0;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Missions
        </Link>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="text-muted">Related:</span>
          <Link
            href={`/tasks?mission=${missionId}`}
            className="transition-colors hover:text-accent"
          >
            Tasks
          </Link>
          {hasPendingDecisions && (
            <Link
              href={`/judgment?mission=${missionId}`}
              className="transition-colors hover:text-accent"
            >
              Judgment
            </Link>
          )}
          {hasCode && (
            <Link href="/code-release" className="transition-colors hover:text-accent">
              Code & Release
            </Link>
          )}
          {activities.length > 0 && (
            <Link
              href={`/organization-feed?mission=${missionId}`}
              className="transition-colors hover:text-accent"
            >
              Organization Feed
            </Link>
          )}
        </nav>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{mission.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{mission.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusPill variant={statusVariant[mission.status]}>{mission.status}</StatusPill>
            <StatusPill variant={healthVariant[mission.health]}>{mission.health}</StatusPill>
            <span className="text-xs text-muted">Updated {mission.updatedAt}</span>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <ProgressBar value={mission.progress} showLabel />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionHeader
              title="Current Lifecycle Phase"
              description={`Active phase: ${mission.lifecycle}`}
            />
            <LifecycleStepper currentPhase={mission.lifecycle} />
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <SectionHeader title="Requirements Summary" />
              <p className="text-sm leading-relaxed text-muted">{mission.requirementsSummary}</p>
            </Card>
            <Card>
              <SectionHeader title="Architecture Summary" />
              <p className="text-sm leading-relaxed text-muted">{mission.architectureSummary}</p>
            </Card>
          </div>

          <Card>
            <SectionHeader title="Assigned AI Team" />
            <div className="flex flex-wrap gap-4">
              {mission.assignedAgents.map((role) => (
                <AgentAvatar key={role} role={role} />
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Active Tasks" />
            {activeTasks.length === 0 ? (
              <p className="text-sm text-muted">No active tasks.</p>
            ) : (
              <ul className="divide-y divide-border">
                {activeTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {task.assignedTo} · ETA {task.eta}
                        {task.dependencies.length > 0 &&
                          ` · Depends: ${task.dependencies.join(", ")}`}
                      </p>
                    </div>
                    <StatusPill variant={taskStatusVariant[task.status]}>{task.status}</StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Pending Decisions" />
            {pendingDecisions.length === 0 ? (
              <p className="text-sm text-muted">No decisions awaiting CEO judgment.</p>
            ) : (
              <ul className="space-y-3">
                {pendingDecisions.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{d.title}</p>
                      <StatusPill variant={d.priority === "high" ? "danger" : "warning"}>
                        {d.priority}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-muted">{d.summary}</p>
                    <Link
                      href={`/judgment?mission=${missionId}`}
                      className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
                    >
                      Open in Judgment Center →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Code — Branches & Pull Requests" />
            {relatedBranches.length === 0 && relatedPrs.length === 0 ? (
              <p className="text-sm text-muted">No linked branches or pull requests yet.</p>
            ) : (
              <div className="space-y-4">
                {relatedBranches.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-muted">Branches</p>
                    <ul className="space-y-2">
                      {relatedBranches.map((b) => (
                        <li
                          key={b.name}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <span className="font-mono text-accent">{b.name}</span>
                          <span className="text-xs text-muted">
                            +{b.ahead} / -{b.behind} · {b.lastCommit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {relatedPrs.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-muted">Pull Requests</p>
                    <ul className="space-y-2">
                      {relatedPrs.map((pr) => (
                        <li
                          key={pr.id}
                          className="flex items-start gap-2 rounded-lg border border-border px-3 py-2"
                        >
                          <GitPullRequest className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              #{pr.number} {pr.title}
                            </p>
                            <p className="text-xs text-muted">
                              {pr.branch} · {pr.author} · {pr.status}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionHeader title="Release Readiness" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-foreground">
                  {mission.releaseReadiness.score}%
                </span>
                <StatusPill
                  variant={
                    mission.releaseReadiness.score >= 80
                      ? "success"
                      : mission.releaseReadiness.score >= 50
                        ? "warning"
                        : "muted"
                  }
                >
                  {mission.releaseReadiness.label}
                </StatusPill>
              </div>
              <ProgressBar value={mission.releaseReadiness.score} />
              <p className="text-sm text-muted">{mission.releaseReadiness.summary}</p>
              {mission.releaseReadiness.blockers.length > 0 && (
                <ul className="space-y-1 border-t border-border pt-3">
                  {mission.releaseReadiness.blockers.map((b) => (
                    <li key={b} className="text-sm text-danger">
                      · {b}
                    </li>
                  ))}
                </ul>
              )}
              {release && (
                <p className="text-xs text-muted">
                  Candidate: v{release.version} ({release.state})
                </p>
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Blockers" />
            {mission.blockers.length === 0 ? (
              <p className="text-sm text-muted">None</p>
            ) : (
              <ul className="space-y-2">
                {mission.blockers.map((b) => (
                  <li key={b} className="text-sm text-danger">
                    · {b}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Recent Activity" />
            <p className="text-sm text-foreground">{mission.recentActivity}</p>
            {activities.length > 0 && (
              <ul className="mt-4 space-y-3 border-t border-border pt-4">
                {activities.map((a) => (
                  <li key={a.id}>
                    <p className="text-xs text-muted">
                      {a.authorName} ({a.author}) · {a.timestamp}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{a.message}</p>
                  </li>
                ))}
              </ul>
            )}
            {activities.length > 0 && (
              <Link
                href={`/organization-feed?mission=${missionId}`}
                className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
              >
                View full Organization Feed →
              </Link>
            )}
          </Card>

          <Card>
            <SectionHeader title="Memory Insights" />
            {memoryInsights.length === 0 ? (
              <p className="text-sm text-muted">No linked memories for this mission.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {memoryInsights.map((m) => (
                    <li key={m.id} className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{m.summary}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/memory"
                  className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                >
                  Open Memory Vault →
                </Link>
              </>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
