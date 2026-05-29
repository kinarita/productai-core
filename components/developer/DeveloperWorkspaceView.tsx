"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeveloperWorkspace } from "@/components/developer/DeveloperWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { ArrowRight } from "lucide-react";

export function DeveloperWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");
  const initialImplementationPlanId = searchParams.get("implementationPlan");

  return (
    <AppShell
      title="Developer Workspace"
      description="Implementation planning support—no auto coding, PRs, or deployment"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/designer-workspace"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Designer Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/architect-workspace"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Architect Workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <DeveloperWorkspace
        missions={missions}
        tasks={tasks}
        initialMissionId={initialMissionId}
        initialImplementationPlanId={initialImplementationPlanId}
      />
    </AppShell>
  );
}
