"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProductBriefWorkspace } from "@/components/brief/ProductBriefWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { ArrowRight } from "lucide-react";

export function ProductBriefWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const searchParams = useSearchParams();
  const initialBriefId = searchParams.get("brief");
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="Product Brief Workspace"
      description="Planner → CEO Review → CEO Approval → Director Handoff Ready—human authorization only"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/idea-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Idea Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/team-handoff" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Team Handoff <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ProductBriefWorkspace
        missions={missions}
        initialBriefId={initialBriefId}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
