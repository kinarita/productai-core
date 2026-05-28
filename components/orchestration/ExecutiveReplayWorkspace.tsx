"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card } from "@/components/Card";
import { ReplayBookmarkPanel } from "@/components/orchestration/ReplayBookmarkPanel";
import { ReplaySessionRecommendations } from "@/components/orchestration/ReplaySessionRecommendations";
import { GovernanceReplayWalkthrough } from "@/components/orchestration/GovernanceReplayWalkthrough";
import { replayInterpretationPresets } from "@/lib/orchestration/governance-history/replayInterpretationPresets";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import { useReplayPersonalizationStore } from "@/lib/store/replayPersonalizationStore";
import { useReplayTutorialStore } from "@/lib/store/replayTutorialStore";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";
import { buildReplayLiteracySummary } from "@/lib/orchestration/governance-history/replayLiteracy";
import type { ExecutiveReplaySummary } from "@/lib/orchestration/governance-history/governanceHistoryTypes";

interface ExecutiveReplayWorkspaceProps {
  replayQuery?: ReplayQueryState;
  replayDiagnostics?: ReplayDiagnostics | null;
  replaySummary?: ExecutiveReplaySummary | null;
  linkBasePath?: string;
}

export function ExecutiveReplayWorkspace({
  replayQuery = replayQueryDefaults,
  replayDiagnostics = null,
  replaySummary = null,
  linkBasePath = "/runtime-cost",
}: ExecutiveReplayWorkspaceProps) {
  const recordReplayView = useReplayPersonalizationStore((s) => s.recordReplayView);
  const preferredPresetId = useReplayPersonalizationStore((s) => s.preferredInterpretationPreset);
  const setPreferredInterpretationPreset = useReplayPersonalizationStore(
    (s) => s.setPreferredInterpretationPreset
  );
  const readabilityMode = useReplayPersonalizationStore((s) => s.readabilityMode);
  const setReadabilityMode = useReplayPersonalizationStore((s) => s.setReadabilityMode);
  const completedSteps = useReplayTutorialStore((s) => s.completedSteps);

  useEffect(() => {
    recordReplayView(replayQuery);
  }, [recordReplayView, replayQuery]);

  return (
    <Card
      title="Executive Replay Workspace"
      description="Bookmarks, interpretation presets, and reading continuity for governance replay"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">{buildReplayLiteracySummary(replayDiagnostics)}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setReadabilityMode("compact")}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
              readabilityMode === "compact"
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border text-muted"
            }`}
          >
            Compact
          </button>
          <button
            type="button"
            onClick={() => setReadabilityMode("expanded")}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
              readabilityMode === "expanded"
                ? "border-accent bg-indigo-50 text-accent"
                : "border-border text-muted"
            }`}
          >
            Expanded
          </button>
        </div>
      </div>
      {replaySummary ? (
        <p className="mt-2 text-xs text-muted">{replaySummary.governanceHealthSummary}</p>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Interpretation presets</p>
        <ul className="mt-2 space-y-2">
          {replayInterpretationPresets.map((preset) => (
            <li
              key={preset.id}
              className="rounded-lg border border-border bg-background px-3 py-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{preset.title}</p>
                <Link
                  href={buildReplayHref(
                    linkBasePath,
                    mergeReplayQuery(replayQuery, preset.recommendedReplayQuery)
                  )}
                  onClick={() => setPreferredInterpretationPreset(preset.id)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Apply preset →
                </Link>
              </div>
              <p className="mt-1 text-xs text-muted">{preset.description}</p>
              <p className="mt-1 text-[11px] text-muted">{preset.recommendedAction}</p>
              {preferredPresetId === preset.id ? (
                <p className="mt-1 text-[11px] text-foreground">Preferred preset</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Replay bookmarks</p>
        <ReplayBookmarkPanel currentReplayQuery={replayQuery} linkBasePath={linkBasePath} />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Session recommendations</p>
        <ReplaySessionRecommendations baseReplayQuery={replayQuery} linkBasePath={linkBasePath} />
      </div>

      {completedSteps.length < 4 ? (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase text-muted">Walkthrough continuation</p>
          <div className="mt-2">
            <GovernanceReplayWalkthrough
              baseReplayQuery={replayQuery}
              linkBasePath={linkBasePath}
              compact
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
