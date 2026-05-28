"use client";

import { Card } from "@/components/Card";
import { ReplayInterpretationHistoryPanel } from "@/components/orchestration/ReplayInterpretationHistoryPanel";
import { GovernanceJournalPanel } from "@/components/orchestration/GovernanceJournalPanel";
import { ReplayComparisonPanel } from "@/components/orchestration/ReplayComparisonPanel";
import { InterpretationTimeline } from "@/components/orchestration/InterpretationTimeline";
import { ExecutiveGovernanceDigestPanel } from "@/components/orchestration/ExecutiveGovernanceDigest";
import { ReplaySessionRecommendations } from "@/components/orchestration/ReplaySessionRecommendations";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ExecutiveReviewSessionProps {
  replayQuery: ReplayQueryState;
  replayDiagnostics?: ReplayDiagnostics | null;
  interpretationPreset?: string | null;
  linkBasePath?: string;
  onExportDigest?: (text: string) => void;
  missionId?: string;
}

export function ExecutiveReviewSession({
  replayQuery,
  replayDiagnostics = null,
  interpretationPreset = null,
  linkBasePath = "/runtime-cost",
  onExportDigest,
  missionId,
}: ExecutiveReviewSessionProps) {
  return (
    <Card
      title="Executive Review Session"
      description="Interpretation history, journaling, and digest continuity for governance reading"
    >
      <ExecutiveGovernanceDigestPanel onExportDigest={onExportDigest} />
      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Active replay interpretation</p>
        <ReplayInterpretationHistoryPanel
          replayQuery={replayQuery}
          replayDiagnostics={replayDiagnostics}
          interpretationPreset={interpretationPreset}
          linkBasePath={linkBasePath}
          compact
        />
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Governance journal</p>
        <GovernanceJournalPanel
          replayQuery={replayQuery}
          missionId={missionId}
          compact
        />
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Replay comparison</p>
        <ReplayComparisonPanel currentDiagnostics={replayDiagnostics} />
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Interpretation timeline</p>
        <InterpretationTimeline linkBasePath={linkBasePath} />
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Recommended replay follow-up</p>
        <ReplaySessionRecommendations baseReplayQuery={replayQuery} linkBasePath={linkBasePath} />
      </div>
    </Card>
  );
}
