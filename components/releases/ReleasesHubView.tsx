"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { buildHumanReleaseCards } from "@/lib/human-first/releaseCards";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { pullRequests, releases } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function ReleasesHubView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);

  const cards = buildHumanReleaseCards({
    missions,
    tasks,
    pullRequests,
    releases,
    feedItems,
  });

  return (
    <AppShell
      title="Releases"
      description="What has shipped and what is on the way—at a glance"
    >
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Each card is a project. Green means live, blue is preparing, yellow is staging, white means
        not released yet.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li
            key={card.missionId}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">{card.projectName}</h2>
              <span className="shrink-0 text-sm font-medium" title={card.releaseStatusLabel}>
                {card.releaseStatusEmoji} {card.releaseStatusLabel}
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2 text-muted">
                <dt>Release date</dt>
                <dd className={cn("text-foreground", card.releaseDate === "—" && "text-muted")}>
                  {card.releaseDate}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-muted">{card.outcomeSummary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/release-workspace?mission=${card.missionId}`}
                className="text-xs text-accent hover:underline"
              >
                Pre-release details
              </Link>
              <Link
                href={`/code-release-workspace?mission=${card.missionId}`}
                className="text-xs text-muted hover:text-accent hover:underline"
              >
                After release
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {cards.length === 0 ? (
        <p className="text-sm text-muted">No projects yet.</p>
      ) : null}

      <p className="mt-8 text-xs text-muted">
        <Link href="/" className="text-accent hover:underline">
          ← Back to Projects
        </Link>
      </p>
    </AppShell>
  );
}
