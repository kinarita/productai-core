"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ArtifactReviewWorkspace } from "@/components/review/ArtifactReviewWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { ArrowRight } from "lucide-react";

export function ArtifactReviewView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");
  const initialArtifactId = searchParams.get("artifact");

  return (
    <AppShell
      title="Artifact Review Workspace"
      description="Review state, history, and human comments for team artifacts—review support only"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/team-handoff" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Team Handoff <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/product-lifecycle" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Product Lifecycle <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ArtifactReviewWorkspace
        missions={missions}
        tasks={tasks}
        initialMissionId={initialMissionId}
        initialArtifactId={initialArtifactId}
      />
    </AppShell>
  );
}
