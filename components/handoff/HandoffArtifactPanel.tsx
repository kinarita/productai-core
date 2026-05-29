"use client";

import Link from "next/link";
import type { HandoffArtifact } from "@/lib/handoff/handoffArtifacts";
import { isReviewTargetType } from "@/lib/review/artifactReview";
import { RoleArtifactCard } from "@/components/handoff/RoleArtifactCard";
import { useHandoffWorkspaceStore } from "@/lib/store/handoffWorkspaceStore";

export function HandoffArtifactPanel({
  artifacts,
}: {
  artifacts: HandoffArtifact[];
}) {
  const selectedArtifactId = useHandoffWorkspaceStore((s) => s.selectedArtifactId);
  const selected = selectedArtifactId
    ? artifacts.find((a) => a.id === selectedArtifactId)
    : artifacts.find((a) => a.isPrimary) ?? artifacts[0];

  if (artifacts.length === 0) {
    return <p className="text-xs text-muted">No artifacts match the current filters.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ul className="space-y-2">
        {artifacts.map((artifact) => (
          <li key={artifact.id}>
            <RoleArtifactCard artifact={artifact} />
          </li>
        ))}
      </ul>
      {selected ? (
        <div className="rounded-lg border border-border px-4 py-3">
          <p className="text-[10px] uppercase text-muted">Selected Artifact</p>
          <p className="mt-1 text-sm font-medium">{selected.title}</p>
          <p className="mt-2 text-xs text-muted">{selected.summary}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 px-3 py-2">
              <p className="text-[10px] uppercase text-muted">Role</p>
              <p className="text-xs">{selected.roleLabel}</p>
            </div>
            <div className="rounded-lg border border-border/60 px-3 py-2">
              <p className="text-[10px] uppercase text-muted">Status</p>
              <p className="text-xs">{selected.statusLabel}</p>
            </div>
          </div>
          <Link
            href={`/missions/${selected.missionId}`}
            className="mt-3 mr-4 inline-block text-xs text-accent hover:underline"
          >
            View mission →
          </Link>
          {isReviewTargetType(selected.typeId) ? (
            <Link
              href={`/artifact-review?mission=${selected.missionId}&artifact=${selected.id}`}
              className="mt-3 inline-block text-xs text-accent hover:underline"
            >
              Open Review Workspace →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
