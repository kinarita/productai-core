"use client";

import Link from "next/link";
import type { Mission, Task } from "@/types/productai";
import { buildMissionReviewContext, buildReviewTimeline, buildArtifactReviewRecords } from "@/lib/review/reviewAnalysis";
import { ArtifactReviewTimeline } from "@/components/review/ArtifactReviewTimeline";
import { artifactLineageHref } from "@/lib/lineage/artifactLineageWorkspace";

export function MissionReviewContextPanel({
  mission,
  tasks,
}: {
  mission: Mission;
  tasks: Task[];
}) {
  const context = buildMissionReviewContext({ mission, tasks });
  const records = buildArtifactReviewRecords({ missions: [mission], tasks });
  const selectedRecord = records.find((r) => r.artifactId === context.currentArtifactId);
  const timeline = selectedRecord ? buildReviewTimeline({ record: selectedRecord }) : [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{context.progressNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Current Artifact</p>
          <p className="text-sm">{context.currentArtifact}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Review State</p>
          <p className="text-sm">{context.reviewStateLabel}</p>
        </div>
      </div>
      {context.reviewHistory.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Review History</p>
          <ul className="mt-1 space-y-1">
            {context.reviewHistory.map((h) => (
              <li key={`${h.label}-${h.at}`} className="text-xs text-muted">
                · {h.label} — {h.state} ({h.at})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {timeline.length > 0 ? <ArtifactReviewTimeline steps={timeline} compact /> : null}
      <div className="flex flex-wrap gap-4">
        <Link
          href={`/artifact-review?mission=${mission.id}${context.currentArtifactId ? `&artifact=${context.currentArtifactId}` : ""}`}
          className="text-xs text-accent hover:underline"
        >
          Open Artifact Review
        </Link>
        <Link
          href={artifactLineageHref({
            missionId: mission.id,
            artifactId: context.currentArtifactId ?? undefined,
          })}
          className="text-xs text-accent hover:underline"
        >
          Open Artifact Lineage
        </Link>
      </div>
    </div>
  );
}

export function CooReviewCoordinationPanel({
  coordination,
}: {
  coordination: ReturnType<
    typeof import("@/lib/review/reviewAnalysis").buildCooReviewCoordination
  >;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{coordination.advisoryNote}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Review Concentrations</p>
          <p className="text-lg font-semibold">{coordination.reviewConcentrations}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Pending Reviews</p>
          <p className="text-lg font-semibold">{coordination.pendingReviews}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Cross-Team Areas</p>
          <p className="text-lg font-semibold">{coordination.crossTeamReviewAreas.length}</p>
        </div>
      </div>
      {coordination.crossTeamReviewAreas.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Cross-Team Review Areas</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {coordination.crossTeamReviewAreas.map((area) => (
              <li key={area}>· {area}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link href="/artifact-review" className="inline-block text-xs text-accent hover:underline">
        Open Artifact Review Workspace
      </Link>
    </div>
  );
}
