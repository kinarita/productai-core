"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ArchitectWorkspace } from "@/components/architect/ArchitectWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { ArrowRight } from "lucide-react";

export function ArchitectWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");
  const initialSpecificationId = searchParams.get("specification");

  return (
    <AppShell
      title="Architect Workspace"
      description="Technical Specification and design support—no auto coding or deployment"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/director-workspace"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Director Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/product-brief"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Product Brief Workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ArchitectWorkspace
        missions={missions}
        tasks={tasks}
        initialMissionId={initialMissionId}
        initialSpecificationId={initialSpecificationId}
      />
    </AppShell>
  );
}
