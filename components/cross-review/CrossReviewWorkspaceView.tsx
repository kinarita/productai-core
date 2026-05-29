"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CrossReviewWorkspace } from "@/components/cross-review/CrossReviewWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";

export function CrossReviewWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");
  const initialArtifactId = searchParams.get("artifact");
  const initialReviewId = searchParams.get("review");

  return (
    <AppShell
      title="Reviews"
      description="Cross-role review visibility—see what is pending, in review, and approved without automatic approval"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/artifact-lineage" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Artifact Lineage <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/artifact-review" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Artifact Review <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <CrossReviewWorkspace
        missions={missions}
        tasks={tasks}
        feedItems={feedItems}
        initialMissionId={initialMissionId}
        initialArtifactId={initialArtifactId}
        initialReviewId={initialReviewId}
      />
    </AppShell>
  );
}
