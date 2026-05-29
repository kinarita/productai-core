"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CeoIdeaWorkspace } from "@/components/idea/CeoIdeaWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { ArrowRight } from "lucide-react";

export function IdeaWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const searchParams = useSearchParams();
  const initialIdeaId = searchParams.get("idea");

  return (
    <AppShell
      title="CEO Idea Workspace"
      description="CEO idea exploration through Product Brief—planning support and human authorization only"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/artifact-review" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Artifact Review <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/team-handoff" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Team Handoff <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <CeoIdeaWorkspace missions={missions} initialIdeaId={initialIdeaId} />
    </AppShell>
  );
}
