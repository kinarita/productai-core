import type { Mission, OrganizationFeedItem, PullRequest, ReleaseItem, Task } from "@/types/productai";
import { buildMissionReleaseReadinessRow } from "@/lib/release/releaseReadiness";
import { detectReleaseRisks } from "@/lib/release/releaseRisks";
import { buildOutcomeSignals } from "@/lib/outcome/outcomeSignals";
import type { ReleaseReadinessLevelId } from "@/lib/release/releaseWorkspace";
import { memories } from "@/data/mockData";

export type HumanReleaseStatusId = "live" | "preparing" | "staging" | "not_released";

export interface HumanReleaseCard {
  missionId: string;
  projectName: string;
  releaseStatus: HumanReleaseStatusId;
  releaseStatusLabel: string;
  releaseStatusEmoji: string;
  releaseDate: string;
  outcomeSummary: string;
}

const releasePresentation: Record<
  HumanReleaseStatusId,
  { emoji: string; label: string }
> = {
  live: { emoji: "🟢", label: "Live" },
  preparing: { emoji: "🔵", label: "Preparing" },
  staging: { emoji: "🟡", label: "Staging" },
  not_released: { emoji: "⚪", label: "Not Released" },
};

function mapReadinessLevel(level: ReleaseReadinessLevelId): HumanReleaseStatusId {
  if (level === "released") return "live";
  if (level === "candidate" || level === "ready_for_release") return "staging";
  if (level === "preparing") return "preparing";
  return "not_released";
}

export function buildHumanReleaseCards(input: {
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
  feedItems: OrganizationFeedItem[];
}): HumanReleaseCard[] {
  const risks = detectReleaseRisks(input);

  return input.missions.map((mission) => {
    const riskCount = risks.filter((r) => r.missionId === mission.id).length;
    const row = buildMissionReleaseReadinessRow({
      mission,
      tasks: input.tasks,
      pullRequests: input.pullRequests,
      releases: input.releases,
      riskCount,
    });
    const releaseStatus = mapReadinessLevel(row.readinessLevel);
    const presentation = releasePresentation[releaseStatus];
    const production = input.releases.find(
      (r) => r.relatedMissionId === mission.id && r.state === "production"
    );
    const signals = buildOutcomeSignals({
      mission,
      tasks: input.tasks,
      memories,
      feedItems: input.feedItems,
      releases: input.releases,
    });

    return {
      missionId: mission.id,
      projectName: mission.name,
      releaseStatus,
      releaseStatusLabel: presentation.label,
      releaseStatusEmoji: presentation.emoji,
      releaseDate: production?.deployedAt ?? mission.updatedAt ?? "—",
      outcomeSummary:
        signals[0]?.message ??
        mission.releaseReadiness.summary ??
        "No outcome recorded yet.",
    };
  });
}
