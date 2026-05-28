"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import Link from "next/link";
import { GovernanceMemoryCard } from "@/components/orchestration/GovernanceMemoryCard";
import { memories } from "@/data/mockData";
import { buildGovernanceReplay } from "@/lib/orchestration/governance-history/governanceReplay";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useMemo } from "react";
import { BookMarked } from "lucide-react";

const categoryLabels = {
  learning: "Organizational Learning",
  architecture: "Architecture Wisdom",
  incident: "Incident Lesson",
  pattern: "Successful Pattern",
};

const categoryVariant = {
  learning: "default" as const,
  architecture: "accent" as const,
  incident: "warning" as const,
  pattern: "success" as const,
};

export default function MemoryPage() {
  const processingSessions = useProcessingStore((s) => s.getSessions());
  const processingAuditTrail = useProcessingStore((s) => s.getAuditTrail());
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
    <AppShell
      title="Memory Vault"
      description="Organizational wisdom — quietly preserved for future missions"
    >
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
        These memories are not logs. They are distilled learnings that guide how your AI
        organization builds software over time.
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
                    {categoryLabels[memory.category]}
                  </Badge>
                  {memory.relatedMissionId && memory.missionName && (
                    <MissionLink
                      missionId={memory.relatedMissionId}
                      missionName={memory.missionName}
                      variant="pill"
                    />
                  )}
                  <span className="text-xs text-muted">· {memory.createdAt}</span>
                </div>
                <h3 className="mt-2 text-base font-medium text-foreground">{memory.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{memory.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Governance Memory</h2>
        <p className="mt-1 text-xs text-muted">
          Derived governance learnings captured as recurring risks and review patterns.
        </p>
        <div className="mt-3 grid gap-3">
          {replay.memoryItems.map((item) => (
            <GovernanceMemoryCard key={item.id} item={item} missionNameMap={missionNameMap} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <Link href="/runtime-cost" className="font-medium text-accent hover:underline">
            Open Operational Replay →
          </Link>
          <Link href="/organization-feed?gov=processing_governance" className="font-medium text-accent hover:underline">
            Open Governance Feed →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
