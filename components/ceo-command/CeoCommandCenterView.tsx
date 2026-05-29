"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CeoCommandCenterWorkspace } from "@/components/ceo-command/CeoCommandCenterWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { memories, pullRequests, releases } from "@/data/mockData";

export function CeoCommandCenterView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="CEO Command Center"
      description="Single executive view of product progress, reviews, and workspace navigation—visibility only"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/review-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Review Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/artifact-lineage" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Artifact Lineage <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <CeoCommandCenterWorkspace
        missions={missions}
        tasks={tasks}
        feedItems={feedItems}
        releases={releases}
        memories={memories}
        pullRequests={pullRequests}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
