"use client";

import { formatVersionTimelineLabel } from "@/lib/brief-diff/briefVersionLabels";
import type { BriefVersionRecord } from "@/lib/discussion/discussionTypes";

export function BriefHistoryPanel({
  versions,
  currentVersion,
  approvedVersion,
  selectedCompareTo,
  onSelectVersion,
}: {
  versions?: BriefVersionRecord[];
  currentVersion?: number;
  approvedVersion?: number;
  selectedCompareTo?: number;
  onSelectVersion?: (version: number) => void;
}) {
  if (!versions?.length) {
    return (
      <p className="text-sm text-muted">
        Brief history will appear after the first Product Brief is generated.
      </p>
    );
  }

  const sorted = [...versions].sort((a, b) => b.version - a.version);

  return (
    <ul className="space-y-2">
      {sorted.map((v) => {
        const isSelected = selectedCompareTo === v.version;
        const canCompare = v.version > 1 && onSelectVersion;

        return (
          <li key={v.version}>
            <button
              type="button"
              disabled={!canCompare}
              onClick={() => canCompare && onSelectVersion(v.version)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                v.version === currentVersion
                  ? "border-accent/40 bg-indigo-50/40"
                  : isSelected
                    ? "border-success/40 bg-emerald-50/40"
                    : "border-border bg-surface hover:bg-surface/80"
              } ${canCompare ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  {formatVersionTimelineLabel(v, v.changeSummary?.proposalTitle)}
                </span>
                <span className="text-xs text-muted">
                  {new Date(v.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {v.source === "initial"
                  ? "Initial Planner Brief"
                  : v.source === "validation_apply"
                    ? "From validation loop"
                    : "From CEO discussion"}
                {v.version === approvedVersion ? (
                  <span className="ml-2 text-success">· CEO approved version</span>
                ) : null}
                {v.version === currentVersion ? (
                  <span className="ml-2 text-accent">· current</span>
                ) : null}
                {isSelected ? (
                  <span className="ml-2 text-success">· viewing diff</span>
                ) : null}
              </p>
              {v.changeSummary && v.version > 1 ? (
                <p className="mt-1 text-xs text-foreground">
                  {v.changeSummary.added.length
                    ? `+ ${v.changeSummary.added.slice(0, 2).join(", ")}`
                    : null}
                  {v.changeSummary.modified.length
                    ? ` · ~ ${v.changeSummary.modified.join(", ")}`
                    : null}
                </p>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
