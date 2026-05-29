"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { QaWorkspace } from "@/components/qa/QaWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { pullRequests, releases } from "@/data/mockData";

export function QaWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");
  const initialTestPlanId = searchParams.get("testPlan");

  return (
    <AppShell title="QA Workspace" description="Quality planning support—no auto testing or release execution">
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/developer-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Developer Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/release-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Release Readiness <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <QaWorkspace
        missions={missions}
        tasks={tasks}
        pullRequests={pullRequests}
        releases={releases}
        initialMissionId={initialMissionId}
        initialTestPlanId={initialTestPlanId}
      />
    </AppShell>
  );
}

