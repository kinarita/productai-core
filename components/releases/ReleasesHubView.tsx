"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useReleaseWorkspace } from "@/lib/hooks/useReleaseWorkspace";
import { useOutcomeWorkspace } from "@/lib/hooks/useOutcomeWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { memories, pullRequests, releases } from "@/data/mockData";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { ArrowRight } from "lucide-react";

export function ReleasesHubView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const missionId = missions.find((m) => m.status === "active")?.id;

  const release = useReleaseWorkspace({
    missions,
    tasks,
    releases,
    pullRequests,
    missionId: missionId ?? null,
  });

  const outcome = useOutcomeWorkspace({
    missions,
    tasks,
    memories,
    feedItems,
    releases,
    pullRequests,
    missionId: missionId ?? null,
  });

  return (
    <AppShell
      title="Releases"
      description="Release readiness and outcomes—no automatic deployment"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Release readiness"
          description="Checklists, risks, and validation before ship"
        >
          <p className="text-sm text-muted">
            {release.overview?.advisoryNote ??
              "Review release readiness across active missions."}
          </p>
          <Link
            href="/release-workspace"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Open release readiness
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card title="Release outcomes" description="Post-release signals and follow-ups">
          <p className="text-sm text-muted">
            {outcome.overview?.advisoryNote ?? "Observe outcomes after release."}
          </p>
          <Link
            href="/code-release-workspace"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Open code & release
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}
