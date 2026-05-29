"use client";

import Link from "next/link";
import type { ReviewBoardRow } from "@/lib/review/reviewAnalysis";
import { useReviewWorkspaceStore } from "@/lib/store/reviewWorkspaceStore";
import { cn } from "@/lib/utils";

export function ArtifactReviewBoard({ rows }: { rows: ReviewBoardRow[] }) {
  const selectedArtifactId = useReviewWorkspaceStore((s) => s.selectedArtifactId);
  const setSelectedArtifact = useReviewWorkspaceStore((s) => s.setSelectedArtifact);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No artifacts match the current review filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase text-muted">
            <th className="px-2 py-2 font-medium">Artifact</th>
            <th className="px-2 py-2 font-medium">Owner</th>
            <th className="px-2 py-2 font-medium">Mission</th>
            <th className="px-2 py-2 font-medium">Review State</th>
            <th className="px-2 py-2 font-medium">Comments</th>
            <th className="px-2 py-2 font-medium">Reviews</th>
            <th className="px-2 py-2 font-medium">Last Updated</th>
            <th className="px-2 py-2 font-medium">Next Suggested Step</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.artifactId}
              className={cn(
                "border-b border-border/60 transition hover:bg-muted/5",
                selectedArtifactId === row.artifactId && "bg-accent/5"
              )}
            >
              <td className="px-2 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedArtifact(
                      selectedArtifactId === row.artifactId ? null : row.artifactId
                    )
                  }
                  className="font-medium text-accent hover:underline"
                >
                  {row.artifact}
                </button>
              </td>
              <td className="px-2 py-2 text-muted">{row.owner}</td>
              <td className="px-2 py-2">
                <Link href={`/missions/${row.missionId}`} className="text-accent hover:underline">
                  {row.mission}
                </Link>
              </td>
              <td className="px-2 py-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px]">
                  {row.reviewState}
                </span>
              </td>
              <td className="px-2 py-2">{row.comments}</td>
              <td className="px-2 py-2">{row.reviews}</td>
              <td className="px-2 py-2 text-muted">{row.lastUpdated}</td>
              <td className="max-w-[200px] px-2 py-2 text-muted">{row.nextSuggestedStep}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
