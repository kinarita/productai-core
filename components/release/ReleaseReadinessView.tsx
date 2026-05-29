"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ReleaseReadinessWorkspace } from "@/components/release/ReleaseReadinessWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { pullRequests, releases } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

export function ReleaseReadinessView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="Release Readiness Workspace"
      description="Cross-cutting release readiness across mission, task, repository, and review"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/delivery-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Delivery <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/repository-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Repository <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ReleaseReadinessWorkspace
        missions={missions}
        tasks={tasks}
        pullRequests={pullRequests}
        releases={releases}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
