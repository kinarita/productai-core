import type { Mission, Task, ReleaseItem } from "@/types/productai";

export interface ReleaseCoordinationView {
  releaseCandidates: { version: string; missionName: string; branch: string; state: string }[];
  releaseBlockers: string[];
  qaSummary: string;
  documentationSummary: string;
  readinessSummary: string;
}

export function buildReleaseCoordinationView(input: {
  missions: Mission[];
  tasks: Task[];
  releases: ReleaseItem[];
  missionId?: string | null;
}): ReleaseCoordinationView {
  const missions = input.missionId
    ? input.missions.filter((m) => m.id === input.missionId)
    : input.missions;
  const releases = input.missionId
    ? input.releases.filter((r) => r.relatedMissionId === input.missionId)
    : input.releases.filter((r) => r.state === "candidate" || r.state === "staging");

  const releaseCandidates = releases
    .filter((r) => r.state === "candidate" || r.state === "staging")
    .map((r) => ({
      version: r.version,
      missionName: r.missionName,
      branch: r.branch,
      state: r.state,
    }));

  const blockers: string[] = [];
  for (const mission of missions) {
    const missionTasks = input.tasks.filter((t) => t.missionId === mission.id);
    if (mission.blockers.length > 0) {
      blockers.push(...mission.blockers.slice(0, 2));
    }
    if (missionTasks.some((t) => t.status === "in_review" || t.status === "blocked")) {
      blockers.push(`${mission.name}: open review or blocked tasks`);
    }
  }

  const qaTasks = input.tasks.filter((t) => t.assignedTo === "QA");
  const qaSummary =
    qaTasks.filter((t) => t.status !== "completed").length > 0
      ? `${qaTasks.filter((t) => t.status !== "completed").length} QA task(s) in progress`
      : qaTasks.length > 0
        ? "QA tasks completed for coordination reading"
        : "No QA tasks linked";

  const docMissions = missions.filter((m) => Boolean(m.architectureSummary?.trim()));
  const documentationSummary =
    docMissions.length > 0
      ? `${docMissions.length} mission(s) with architecture documentation`
      : "Documentation may benefit from additional review";

  const readinessSummary =
    releaseCandidates.length > 0
      ? `${releaseCandidates.length} release candidate(s) for executive coordination reading`
      : "No release candidates—coordination visibility only";

  return {
    releaseCandidates,
    releaseBlockers: blockers.slice(0, 6),
    qaSummary,
    documentationSummary,
    readinessSummary,
  };
}
