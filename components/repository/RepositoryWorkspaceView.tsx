"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RepositoryWorkspace } from "@/components/repository/RepositoryWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { branches, pullRequests, releases, commits } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

export function RepositoryWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="Repository Coordination Workspace"
      description="Mission, task, branch, pull request, review, and release context—visualization only"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/delivery-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Delivery Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/coo-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          COO Workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <RepositoryWorkspace
        missions={missions}
        tasks={tasks}
        branches={branches}
        pullRequests={pullRequests}
        releases={releases}
        commits={commits}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
