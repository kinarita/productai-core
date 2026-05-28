import Link from "next/link";
import type { GovernanceMemoryItem } from "@/lib/orchestration/governance-history/governanceHistoryTypes";
import { resolveMissionLabel } from "@/lib/orchestration/processing/missionLabel";

export function GovernanceMemoryCard({
  item,
  missionNameMap,
}: {
  item: GovernanceMemoryItem;
  missionNameMap?: Record<string, string>;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase text-muted">{item.memoryType.replaceAll("_", " ")}</p>
      <p className="text-sm font-medium text-foreground">{item.title}</p>
      <p className="text-xs text-muted">{item.summary}</p>
      <p className="text-xs text-muted">Continuity recommendation: {item.recommendation}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {item.relatedMissionIds.slice(0, 3).map((missionId) => (
          <Link key={missionId} href={`/missions/${missionId}`} className="font-medium text-accent hover:underline">
            {resolveMissionLabel({ missionId, missionNameMap })}
          </Link>
        ))}
      </div>
    </div>
  );
}
