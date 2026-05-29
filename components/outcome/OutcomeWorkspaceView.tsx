"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CodeReleaseWorkspace } from "@/components/outcome/CodeReleaseWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { memories, pullRequests, releases } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

export function OutcomeWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="Code & Release Workspace"
      description="Mission through release to outcome—product-focused visibility only"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/release-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Release Readiness <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <CodeReleaseWorkspace
        missions={missions}
        tasks={tasks}
        memories={memories}
        feedItems={feedItems}
        releases={releases}
        pullRequests={pullRequests}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
