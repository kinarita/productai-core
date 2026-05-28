"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { GovernanceReplayWalkthrough } from "@/components/orchestration/GovernanceReplayWalkthrough";
import { ReplayOnboardingSummary } from "@/components/orchestration/ReplayOnboardingSummary";
import { ReplayDiagnosticsDefinition } from "@/components/orchestration/ReplayDiagnosticsDefinition";
import { replayExampleLibrary } from "@/lib/replay-query/replayExampleLibrary";
import { buildReplayHref } from "@/lib/replay-query/replayQueryNavigation";
import { mergeReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { replayQueryDefaults } from "@/lib/replay-query/replayQueryDefaults";
import {
  buildReplayDiagnosticsOnboardingBullets,
  buildReplayLiteracySummary,
} from "@/lib/orchestration/governance-history/replayLiteracy";
import { replayScopeLabels } from "@/lib/replay-query/replayLabels";
import { useReplayTutorialStore } from "@/lib/store/replayTutorialStore";
import type { ReplayDiagnostics } from "@/lib/replay-query/replayDiagnostics";
import type { ReplayQueryState } from "@/lib/replay-query/replayQueryTypes";

interface ExecutiveWalkthroughPanelProps {
  replayQuery?: ReplayQueryState;
  replayDiagnostics?: ReplayDiagnostics | null;
  attentionCount?: number;
  linkBasePath?: string;
  showExamples?: boolean;
  compact?: boolean;
}

const recommendedScopes: Array<{ scope: ReplayQueryState["scope"]; partial: Partial<ReplayQueryState> }> = [
  { scope: "organization", partial: { scope: "organization", replayWindow: "latest" } },
  { scope: "mission", partial: { scope: "mission", governance: "review_lifecycle" } },
  { scope: "runtime", partial: { scope: "runtime", continuity: "continuity_runtime" } },
  { scope: "governance_review", partial: { scope: "governance_review", governanceAttention: "attention" } },
];

export function ExecutiveWalkthroughPanel({
  replayQuery = replayQueryDefaults,
  replayDiagnostics = null,
  attentionCount = 0,
  linkBasePath = "/runtime-cost",
  showExamples = true,
  compact = false,
}: ExecutiveWalkthroughPanelProps) {
  const dismissed = useReplayTutorialStore((s) => s.dismissed);
  const setDismissed = useReplayTutorialStore((s) => s.setDismissed);
  const bullets = buildReplayDiagnosticsOnboardingBullets(replayDiagnostics);

  if (dismissed && compact) {
    return (
      <button
        type="button"
        onClick={() => setDismissed(false)}
        className="text-xs font-medium text-accent hover:underline"
      >
        Show replay onboarding
      </button>
    );
  }

  return (
    <Card
      title="Executive Replay Onboarding"
      description="Replay literacy and governance interpretation guidance"
    >
      <p className="text-xs text-muted">{buildReplayLiteracySummary(replayDiagnostics)}</p>
      {!dismissed ? (
        <>
          <ReplayOnboardingSummary
            diagnostics={replayDiagnostics}
            attentionCount={attentionCount}
            compact={compact}
          />
          <div className="mt-4">
            <GovernanceReplayWalkthrough
              baseReplayQuery={replayQuery}
              linkBasePath={linkBasePath}
              compact={compact}
            />
          </div>
          {replayDiagnostics ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
                <span className="font-medium text-foreground">Visibility:</span>{" "}
                {replayDiagnostics.replayVisibilityScore} — {bullets.visibility}
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
                <span className="font-medium text-foreground">Confidence:</span> {bullets.confidence}
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
                <span className="font-medium text-foreground">Completeness:</span>{" "}
                {Math.round(replayDiagnostics.metadataCompletenessRatio * 100)}% — {bullets.completeness}
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
                <span className="font-medium text-foreground">Continuity:</span> {bullets.continuity}
              </div>
            </div>
          ) : null}
          <div className="mt-3">
            <ReplayDiagnosticsDefinition compact />
          </div>
        </>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-medium uppercase text-muted">Recommended replay scope</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recommendedScopes.map(({ scope, partial }) => (
            <Link
              key={scope}
              href={buildReplayHref(linkBasePath, mergeReplayQuery(replayQuery, partial))}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-surface"
            >
              {replayScopeLabels[scope]}
            </Link>
          ))}
        </div>
      </div>

      {showExamples ? (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase text-muted">Replay examples</p>
          <ul className="mt-2 space-y-2">
            {replayExampleLibrary.map((example) => {
              const href = buildReplayHref(
                example.drilldownPath,
                mergeReplayQuery(replayQuery, example.replayQuery)
              );
              return (
                <li
                  key={example.id}
                  className="rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{example.title}</p>
                    <Link href={href} className="text-xs font-medium text-accent hover:underline">
                      Open example →
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-muted">{example.description}</p>
                  <p className="mt-1 text-[11px] text-muted">{example.recommendedInterpretation}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setDismissed(!dismissed)}
          className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          {dismissed ? "Expand onboarding" : "Collapse onboarding"}
        </button>
      </div>
    </Card>
  );
}
