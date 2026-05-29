"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { CooWorkspace } from "@/components/coo/CooWorkspace";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { buildDecisionAttentionQueue } from "@/lib/orchestration/decision-attention/decisionAttention";
import { buildGovernanceReplay } from "@/lib/orchestration/governance-history/governanceReplay";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import { ArrowRight } from "lucide-react";

export function CooWorkspaceView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const runtimeAlerts = useRuntimeStore((s) => s.alerts);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const processingSessions = useProcessingStore((s) => s.getSessions());
  const processingAuditTrail = useProcessingStore((s) => s.getAuditTrail());
  const replayQuery = replayQueryDefaults;

  const decisionAttention = useMemo(() => {
    const replay = buildGovernanceReplay({
      processingSessions,
      processingAuditTrail,
      feedItems,
      runtimeAlerts,
      syncWarnings,
      replayQuery,
    });
    return buildDecisionAttentionQueue({
      replayDiagnostics: replay.diagnostics,
      memoryItems: replay.memoryItems,
      processingSessions,
      runtimeAlerts,
      replayQuery,
    });
  }, [
    feedItems,
    processingAuditTrail,
    processingSessions,
    replayQuery,
    runtimeAlerts,
    syncWarnings,
  ]);

  return (
    <AppShell
      title="AI COO Workspace"
      description="Operational continuity across active missions—recommendations and visibility only"
    >
      <div className="mb-4">
        <Link href="/ceo-home" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          CEO Home <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <CooWorkspace missions={missions} tasks={tasks} decisionAttention={decisionAttention} />
    </AppShell>
  );
}
