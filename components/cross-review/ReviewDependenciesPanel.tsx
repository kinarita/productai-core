"use client";

import Link from "next/link";
import { reviewDependencyChain } from "@/lib/cross-review/reviewDependencies";
import { artifactLineageHref } from "@/lib/lineage/artifactLineageWorkspace";

export function ReviewDependenciesPanel({
  parent,
  child,
  missionId,
}: {
  parent: string | null;
  child: string | null;
  missionId?: string;
}) {
  return (
    <div className="space-y-4">
      {(parent || child) && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">Parent Artifact</p>
            <p className="text-sm">{parent ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase text-muted">Child Artifact</p>
            <p className="text-sm">{child ?? "—"}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-foreground">Review dependency chain</p>
        <ul className="mt-2 space-y-2">
          {reviewDependencyChain.map((link) => (
            <li key={link.parentArtifact} className="text-center text-xs text-muted">
              {link.parentArtifact}
              <div className="py-1 text-lg leading-none">↓</div>
              {link.childArtifact}
            </li>
          ))}
        </ul>
      </div>

      {missionId ? (
        <Link
          href={artifactLineageHref({ missionId })}
          className="text-xs text-accent hover:underline"
        >
          Open Artifact Lineage
        </Link>
      ) : null}
    </div>
  );
}
