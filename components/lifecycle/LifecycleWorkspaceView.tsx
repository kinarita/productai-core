"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProductLifecycleWorkspace } from "@/components/lifecycle/ProductLifecycleWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { memories, pullRequests, releases } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

export function LifecycleWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("mission");

  return (
    <AppShell
      title="Product Lifecycle Workspace"
      description="Idea through outcome—integrated product journey visibility across existing workspaces"
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/coo-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          AI COO Workspace <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/code-release-workspace" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Code & Release <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ProductLifecycleWorkspace
        missions={missions}
        tasks={tasks}
        memories={memories}
        feedItems={feedItems}
        releases={releases}
        pullRequests={pullRequests}
        initialMissionId={initialMissionId}
      />
    </AppShell>
  );
}
