"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DesignerWorkspace } from "@/components/designer/DesignerWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { ArrowRight } from "lucide-react";

export function DesignerWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");
  const initialUserFlowId = searchParams.get("userFlow");
  const initialDesignSpecificationId = searchParams.get("designSpecification");

  return (
    <AppShell
      title="Designer Workspace"
      description="UX and UI design support—no auto UI generation, Figma editing, or coding"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/architect-workspace"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Architect Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/product-brief"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          Product Brief Workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <DesignerWorkspace
        missions={missions}
        tasks={tasks}
        initialMissionId={initialMissionId}
        initialUserFlowId={initialUserFlowId}
        initialDesignSpecificationId={initialDesignSpecificationId}
      />
    </AppShell>
  );
}
