import type { Mission, Task, PullRequest, ReleaseItem } from "@/types/productai";
import { buildMissionReleaseReadinessRow } from "@/lib/release/releaseReadiness";
import { detectReleaseRisks } from "@/lib/release/releaseRisks";
import type { ReleaseReadinessLevelId } from "@/lib/release/releaseWorkspace";

export interface ReleaseOverviewSummary {
  readyForRelease: number;
  candidate: number;
  preparing: number;
  released: number;
  potentialReadinessRisks: number;
  missionCount: number;
  advisoryNote: string;
}

export function buildReleaseOverviewSummary(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}): ReleaseOverviewSummary {
  const active = input.missions.filter((m) => m.status !== "completed" || m.progress < 100);
  const risks = detectReleaseRisks(input);

  const counts: Record<ReleaseReadinessLevelId, number> = {
    not_ready: 0,
    preparing: 0,
    candidate: 0,
    ready_for_release: 0,
    released: 0,
  };

  for (const mission of input.missions) {
    const missionRisks = risks.filter((r) => r.missionId === mission.id).length;
    const row = buildMissionReleaseReadinessRow({
      mission,
      tasks: input.tasks,
      pullRequests: input.pullRequests,
      releases: input.releases,
      riskCount: missionRisks,
    });
    counts[row.readinessLevel] += 1;
  }

  return {
    readyForRelease: counts.ready_for_release,
    candidate: counts.candidate,
    preparing: counts.preparing + counts.not_ready,
    released: counts.released,
    potentialReadinessRisks: risks.length,
    missionCount: active.length,
    advisoryNote:
      "Release readiness overview supports coordination reading—no automatic release or deploy.",
  };
}

export function buildReleaseMissionBoard(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  missionId?: string | null;
  levelFilter?: ReleaseReadinessLevelId | null;
}) {
  const risks = detectReleaseRisks(input);
  const filteredMissions = input.missionId
    ? input.missions.filter((m) => m.id === input.missionId)
    : input.missions;

  return filteredMissions
    .map((mission) => {
      const riskCount = risks.filter((r) => r.missionId === mission.id).length;
      return buildMissionReleaseReadinessRow({
        mission,
        tasks: input.tasks,
        pullRequests: input.pullRequests,
        releases: input.releases,
        riskCount,
      });
    })
    .filter((row) => !input.levelFilter || row.readinessLevel === input.levelFilter)
    .sort((a, b) => b.readinessScore - a.readinessScore);
}
