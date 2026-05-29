"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MissionDeliveryWorkspace } from "@/components/delivery/MissionDeliveryWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { pullRequests, releases } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

export function DeliveryWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="Mission Delivery Workspace"
      description="Task, review, repository, and release visibility across missions"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/coo-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          AI COO Workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <MissionDeliveryWorkspace
        missions={missions}
        tasks={tasks}
        pullRequests={pullRequests}
        releases={releases}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
