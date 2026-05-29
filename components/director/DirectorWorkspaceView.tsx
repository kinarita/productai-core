"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DirectorWorkspace } from "@/components/director/DirectorWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { ArrowRight } from "lucide-react";

export function DirectorWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialBriefId = searchParams.get("brief");
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="Director Workspace"
      description="Mission Planning Workspace—Approved Product Brief through Architect Handoff readiness"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/product-brief"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Product Brief Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/idea-workspace"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          CEO Idea Workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <DirectorWorkspace
        missions={missions}
        tasks={tasks}
        initialBriefId={initialBriefId}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
