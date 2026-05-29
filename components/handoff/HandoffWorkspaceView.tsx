"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TeamHandoffWorkspace } from "@/components/handoff/TeamHandoffWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { ArrowRight } from "lucide-react";

export function HandoffWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="AI Team Handoff Workflow"
      description="What each AI role receives, produces, and passes forward—visualization only"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/coo-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          AI COO Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/product-lifecycle" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Product Lifecycle <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <TeamHandoffWorkspace
        missions={missions}
        tasks={tasks}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
