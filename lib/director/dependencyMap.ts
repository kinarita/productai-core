import type { Mission } from "@/types/productai";
import type { ProductBriefRecord } from "@/lib/brief/productBriefWorkspace";
import { briefIdFromMission } from "@/lib/brief/productBriefWorkspace";

export interface DependencyMapCard {
  category: string;
  title: string;
  detail: string;
  href?: string;
}

export function buildDependencyMap(input: {
  mission: Mission;
  brief: ProductBriefRecord;
  allMissions: Mission[];
}): DependencyMapCard[] {
  const { mission, brief, allMissions } = input;

  const related = allMissions
    .filter(
      (m) =>
        m.id !== mission.id &&
        (m.relatedPullRequests.some((pr) => mission.relatedPullRequests.includes(pr)) ||
          m.memoryInsightIds.some((id) => mission.memoryInsightIds.includes(id)))
    )
    .slice(0, 3);

  const cards: DependencyMapCard[] = [
    {
      category: "Product Brief",
      title: brief.title,
      detail: `${brief.statusLabel} — ${brief.approvalStateLabel}`,
      href: `/product-brief?brief=${brief.briefId}`,
    },
    {
      category: "Mission",
      title: mission.name,
      detail: `${mission.lifecycle} · ${mission.progress}% · ${mission.health}`,
      href: `/missions/${mission.id}`,
    },
  ];

  related.forEach((m) => {
    cards.push({
      category: "Related Mission",
      title: m.name,
      detail: m.summary.slice(0, 120),
      href: `/missions/${m.id}`,
    });
  });

  if (mission.relatedBranches.length) {
    cards.push({
      category: "Repository Context",
      title: mission.relatedBranches[0],
      detail: `Branches: ${mission.relatedBranches.join(", ")}`,
      href: "/repository-workspace",
    });
  }

  if (mission.releaseReadiness) {
    cards.push({
      category: "Release Context",
      title: mission.releaseReadiness.label,
      detail: mission.releaseReadiness.summary,
      href: "/release-workspace",
    });
  }

  if (!related.length) {
    cards.push({
      category: "Related Missions",
      title: "No cross-mission links detected",
      detail: "Dependency map shows brief and release context only.",
    });
  }

  return cards;
}

export function briefIdForMission(missionId: string): string {
  return briefIdFromMission(missionId);
}
