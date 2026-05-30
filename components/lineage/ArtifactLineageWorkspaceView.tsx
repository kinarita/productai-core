"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ArtifactLineageWorkspace } from "@/components/lineage/ArtifactLineageWorkspace";
import {
  decisionTrailDescription,
  decisionTrailTitle,
} from "@/lib/human-first/terminology";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";

export function ArtifactLineageWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");
  const initialArtifactId = searchParams.get("artifact");

  return (
    <AppShell title={decisionTrailTitle} description={decisionTrailDescription}>
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Projects <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/review-workspace"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Reviews <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ArtifactLineageWorkspace
        missions={missions}
        tasks={tasks}
        feedItems={feedItems}
        initialMissionId={initialMissionId}
        initialArtifactId={initialArtifactId}
      />
    </AppShell>
  );
}
