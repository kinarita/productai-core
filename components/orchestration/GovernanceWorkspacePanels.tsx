"use client";

import { useEffect } from "react";
import { getGovernanceReadingMode } from "@/lib/orchestration/governance-history/readingModes";
import { ExecutiveGovernanceDigestPanel } from "@/components/orchestration/ExecutiveGovernanceDigest";
import { ReplayInterpretationHistoryPanel } from "@/components/orchestration/ReplayInterpretationHistoryPanel";
import { GovernanceJournalPanel } from "@/components/orchestration/GovernanceJournalPanel";
import { ReplayComparisonPanel } from "@/components/orchestration/ReplayComparisonPanel";
import { ReplayReviewSequence } from "@/components/orchestration/ReplayReviewSequence";
import { LongitudinalGovernanceReview } from "@/components/orchestration/LongitudinalGovernanceReview";
import { buildReadingContinuitySummary } from "@/lib/orchestration/governance-history/replayReadingContinuity";
import { useGovernanceWorkspaceStore } from "@/lib/store/governanceWorkspaceStore";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface GovernanceWorkspacePanelsProps {
  replayQuery: ReplayQueryState;
  replayDiagnostics?: ReplayDiagnostics | null;
  interpretationPreset?: string | null;
  linkBasePath?: string;
  missionId?: string;
  onExportDigest?: (text: string) => void;
}

export function GovernanceWorkspacePanels({
  replayQuery,
  replayDiagnostics = null,
  interpretationPreset = null,
  linkBasePath = "/runtime-cost",
  missionId,
  onExportDigest,
}: GovernanceWorkspacePanelsProps) {
  const activeReadingMode = useGovernanceWorkspaceStore((s) => s.activeReadingMode);
  const readingContinuity = useGovernanceWorkspaceStore((s) => s.readingContinuity);
  const recordReadingSession = useGovernanceWorkspaceStore((s) => s.recordReadingSession);

  const mode = getGovernanceReadingMode(activeReadingMode);
  const panels = new Set(mode.recommendedPanels);

  useEffect(() => {
    recordReadingSession({
      readingMode: activeReadingMode,
      replayQuery,
    });
  }, [activeReadingMode, recordReadingSession, replayQuery]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{buildReadingContinuitySummary(readingContinuity)}</p>
      <p className="text-xs text-muted">Reading focus: {mode.readingFocus}</p>

      {panels.has("digest") ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Governance digest</p>
          <ExecutiveGovernanceDigestPanel onExportDigest={onExportDigest} compact />
        </div>
      ) : null}

      {panels.has("replay_history") ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Replay interpretation history</p>
          <ReplayInterpretationHistoryPanel
            replayQuery={replayQuery}
            replayDiagnostics={replayDiagnostics}
            interpretationPreset={interpretationPreset}
            linkBasePath={linkBasePath}
            compact
          />
        </div>
      ) : null}

      {panels.has("journals") ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Governance journals</p>
          <GovernanceJournalPanel replayQuery={replayQuery} missionId={missionId} compact />
        </div>
      ) : null}

      {panels.has("comparison") ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Replay comparison</p>
          <ReplayComparisonPanel currentDiagnostics={replayDiagnostics} />
        </div>
      ) : null}

      {panels.has("continuity_memory") ? (
        <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
          <p className="font-medium text-foreground">Continuity memory</p>
          <p className="mt-1">Recent modes: {readingContinuity.recentReplayModes.join(", ") || "none"}</p>
          <p>Recent focus: {readingContinuity.recentGovernanceFocus.join(", ") || "none"}</p>
          <p>Digest contexts: {readingContinuity.recentDigestContexts.slice(0, 2).join(" · ") || "none"}</p>
        </div>
      ) : null}

      {panels.has("review_sequencing") ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Review sequencing</p>
          <ReplayReviewSequence replayQuery={replayQuery} linkBasePath={linkBasePath} />
        </div>
      ) : null}

      {panels.has("diagnostics") && replayDiagnostics ? (
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted">
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            Visibility: <span className="text-foreground">{replayDiagnostics.replayVisibilityScore}</span>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            Confidence: <span className="text-foreground">{replayDiagnostics.replayConfidence}</span>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            Completeness:{" "}
            <span className="text-foreground">
              {Math.round(replayDiagnostics.metadataCompletenessRatio * 100)}%
            </span>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            Continuity:{" "}
            <span className="text-foreground">
              {replayDiagnostics.continuityStability.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      ) : null}

      {panels.has("longitudinal") ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Longitudinal review</p>
          <LongitudinalGovernanceReview compact />
        </div>
      ) : null}
    </div>
  );
}
