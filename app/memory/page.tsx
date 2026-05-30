"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import Link from "next/link";
import { GovernanceMemoryCard } from "@/components/orchestration/GovernanceMemoryCard";
import { memories } from "@/data/mockData";
import { buildGovernanceReplay } from "@/lib/orchestration/governance-history/governanceReplay";
import {
  memoryCategoryLabels,
  teamKnowledgeDescription,
  teamKnowledgeTitle,
} from "@/lib/human-first/terminology";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useMemo } from "react";
import { BookMarked } from "lucide-react";

const categoryVariant = {
  learning: "default" as const,
  architecture: "accent" as const,
  incident: "warning" as const,
  pattern: "success" as const,
};

export default function MemoryPage() {
  const processingSessions = useProcessingStore((s) => s.sessions);
  const processingAuditTrail = useProcessingStore((s) => s.auditTrail);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);
  const runtimeAlerts = useRuntimeStore((s) => s.alerts);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const missions = useMissionStore((s) => s.missions);
  const missionNameMap = useMemo(
    () => Object.fromEntries(missions.map((mission) => [mission.id, mission.name])),
    [missions]
  );
  const replay = useMemo(
    () =>
      buildGovernanceReplay({
        processingSessions,
        processingAuditTrail,
        feedItems,
        runtimeAlerts,
        syncWarnings,
      }),
    [feedItems, processingAuditTrail, processingSessions, runtimeAlerts, syncWarnings]
  );

  return (
    <AppShell title={teamKnowledgeTitle} description={teamKnowledgeDescription}>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
        These are lessons your AI team saved so the next project goes faster—not raw logs, but
        helpful knowledge anyone can read.
      </p>

      <div className="grid gap-4">
        {memories.map((memory) => (
          <Card key={memory.id} className="border-border/80 bg-background">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-muted">
                <BookMarked className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={categoryVariant[memory.category]}>
                    {memoryCategoryLabels[memory.category]}
                  </Badge>
                  {memory.relatedMissionId && memory.missionName && (
                    <MissionLink
                      missionId={memory.relatedMissionId}
                      missionName={memory.missionName}
                      variant="pill"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{memory.title}</p>
                <p className="mt-1 text-sm text-muted">{memory.summary}</p>
                <p className="mt-2 text-xs text-muted">
                  {memory.createdAt}
                  {memory.relatedMissionId
                    ? ` · ${missionNameMap[memory.relatedMissionId] ?? memory.missionName}`
                    : ""}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {replay.memoryItems.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Patterns from recent work
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {replay.memoryItems.map((item) => (
              <li key={item.id}>
                <GovernanceMemoryCard item={item} missionNameMap={missionNameMap} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-8 text-xs text-muted">
        <Link href="/" className="text-accent hover:underline">
          ← Back to Projects
        </Link>
      </p>
    </AppShell>
  );
}
