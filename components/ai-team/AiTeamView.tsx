"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { agentFirstAdvisoryNote } from "@/lib/agent-first/agentFirstNav";
import { mergePlannerIntoWorkerStatuses } from "@/lib/agents/planner/plannerWorkerOverlay";
import { buildAiWorkerStatusesForMission } from "@/lib/agent-first/workerAnalysis";
import { usePlannerAgentStore } from "@/lib/store/plannerAgentStore";
import { AiWorkerDetailPanel } from "@/components/ai-team/AiWorkerDetailPanel";
import { useMissionStore } from "@/lib/store/missionStore";
import type { AiWorkerId } from "@/lib/agent-first/aiWorkers";

export function AiTeamView() {
  const searchParams = useSearchParams();
  const missionIdParam = searchParams.get("mission");
  const missions = useMissionStore((s) => s.missions);

  const activeMissions = missions.filter((m) => m.status === "active" || m.status === "planning");
  const selectedMissionId = missionIdParam ?? activeMissions[0]?.id ?? null;
  const selectedMission = missions.find((m) => m.id === selectedMissionId) ?? activeMissions[0];

  const plannerRun = usePlannerAgentStore((s) =>
    selectedMission ? s.getRun(selectedMission.id) : undefined
  );

  const workers = useMemo(
    () =>
      selectedMission
        ? mergePlannerIntoWorkerStatuses(
            buildAiWorkerStatusesForMission(selectedMission),
            plannerRun
          )
        : [],
    [selectedMission, plannerRun]
  );

  const defaultWorkerId =
    workers.find((w) => w.status === "in_progress")?.worker.id ??
    workers.find((w) => w.status === "waiting")?.worker.id ??
    workers[0]?.worker.id;

  const [selectedWorkerId, setSelectedWorkerId] = useState<AiWorkerId | null>(null);
  const effectiveWorkerId = selectedWorkerId ?? defaultWorkerId ?? null;

  return (
    <AppShell
      title="AI Team"
      description="Your AI workers—what they did, why, and what they produced"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted">{agentFirstAdvisoryNote}</p>

        {activeMissions.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {activeMissions.map((m) => (
              <Link
                key={m.id}
                href={`/ai-team?mission=${m.id}`}
                className={
                  m.id === selectedMission?.id
                    ? "rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
                    : "rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface"
                }
              >
                {m.name}
              </Link>
            ))}
          </div>
        ) : null}

        {selectedMission ? (
          <>
            <Card
              title={selectedMission.name}
              description={`Progress ${selectedMission.progress}% · Assign work without learning org charts`}
            >
              <ul className="space-y-3">
                {workers.map((entry) => (
                  <li key={entry.worker.id}>
                    <AiWorkerDetailPanel
                      entry={entry}
                      missionId={selectedMission.id}
                      selected={effectiveWorkerId === entry.worker.id}
                      onSelect={() => setSelectedWorkerId(entry.worker.id)}
                    />
                  </li>
                ))}
              </ul>
            </Card>

            <p className="text-xs text-muted">
              Internal role workspaces (Director, COO, etc.) remain available from advanced links—hidden from the main menu in Phase 1.
            </p>
          </>
        ) : (
          <Card title="No active project">
            <p className="text-sm text-muted">
              <Link href="/idea-workspace" className="text-accent hover:underline">
                Start a project
              </Link>{" "}
              to see your AI team.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
