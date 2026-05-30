"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { BriefDiffViewer } from "@/components/projects/BriefDiffViewer";
import { BriefHistoryPanel } from "@/components/projects/BriefHistoryPanel";
import { DiscussionMessageBubble } from "@/components/projects/DiscussionMessageBubble";
import type { BriefApplyFeedback } from "@/lib/brief-diff/briefDiffTypes";
import { getVersionPairDiff } from "@/lib/brief-diff/getVersionPairDiff";
import { getCooReviewReport } from "@/lib/coo-review/architectGate";
import { EXAMPLE_DISCUSSION_PROMPTS } from "@/lib/discussion/discussionTypes";
import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { Mission } from "@/types/productai";

/** Phase 24.6 — primary discussion viewport (scrollable). */
const DISCUSSION_VIEWPORT_CLASS =
  "min-h-[400px] h-[50vh] max-h-[60vh] overflow-y-auto md:min-h-[600px] md:h-[65vh] md:max-h-[75vh]";

function formatChangeBullets(summary: BriefApplyFeedback["summary"]): string[] {
  return [
    ...summary.added.map((item) => `• ${item} (Added)`),
    ...summary.modified.map((item) => `• ${item} (Modified)`),
    ...summary.removed.map((item) => `• ${item} (Removed)`),
  ];
}

function BriefApplyFeedbackBlock({
  feedback,
  onClose,
}: {
  feedback: BriefApplyFeedback;
  onClose: () => void;
}) {
  const changeLines = formatChangeBullets(feedback.summary);

  return (
    <div
      className="relative rounded-lg border border-success/30 bg-emerald-50/40 px-4 py-3 pr-11"
      role="status"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification. Brief version is unchanged."
        className="absolute right-3 top-3 rounded-md p-1 text-muted transition-colors hover:bg-success/10 hover:text-foreground"
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      <p className="text-sm font-semibold text-success">✅ Brief Updated</p>
      <p className="mt-1 text-sm text-foreground">
        v{feedback.version} created from v{feedback.previousVersion}
      </p>
      {changeLines.length > 0 ? (
        <>
          <p className="mt-2 text-xs font-medium text-foreground">Changes:</p>
          <ul className="mt-1 space-y-0.5 text-xs text-foreground">
            {changeLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function PendingProposalCard({
  proposal,
  onApply,
  onDismiss,
  busy,
}: {
  proposal: BriefChangeProposal;
  onApply: () => void;
  onDismiss: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-lg border border-warning/30 bg-amber-50/50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-warning">Suggested Change</p>
      <p className="mt-1 text-sm font-medium text-foreground">{proposal.title}</p>
      <p className="mt-1 text-xs text-muted">
        <span className="font-medium text-foreground">Reason:</span>{" "}
        {proposal.reason ?? proposal.description}
      </p>
      <p className="mt-1 text-xs text-muted">
        <span className="font-medium text-foreground">Impact:</span> {proposal.impact ?? "—"}
      </p>
      <p className="mt-2 text-xs text-muted">
        Confidence: {proposal.confidence}% · Sections:{" "}
        {(proposal.affectedSections ?? [proposal.targetSection]).join(", ")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onApply}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Apply to Brief
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDismiss}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function DiscoveryDiscussionCard({
  mission,
  run,
  missionId,
}: {
  mission: Mission;
  run?: PlannerAgentRun;
  missionId: string;
}) {
  const report = getCooReviewReport(mission, run);
  const sendMessage = useAgentRunsStore((s) => s.sendDiscoveryDiscussionMessage);
  const applyProposal = useAgentRunsStore((s) => s.applyDiscoveryBriefProposal);
  const dismissProposal = useAgentRunsStore((s) => s.dismissDiscoveryBriefProposal);
  const clearApplyFeedback = useAgentRunsStore((s) => s.clearBriefApplyFeedback);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewDiffVersion, setViewDiffVersion] = useState<number | undefined>();

  const messages = run?.discussionMessages ?? [];
  const pendingProposals = (run?.pendingProposals ?? []).filter((p) => p.status === "pending");
  const applyFeedback =
    run?.lastBriefApplyFeedback?.missionId === missionId
      ? run.lastBriefApplyFeedback
      : undefined;
  const currentVersion = run?.briefVersion;

  useEffect(() => {
    if (applyFeedback?.version) {
      setViewDiffVersion(applyFeedback.version);
    }
  }, [applyFeedback?.createdAt, applyFeedback?.version]);

  const pairDiff =
    viewDiffVersion != null
      ? getVersionPairDiff(run?.briefVersions, viewDiffVersion)
      : null;

  if (!report) {
    return (
      <Card title="Discovery Discussion">
        <p className="text-sm text-muted">
          Discovery Discussion opens after COO Review completes.
        </p>
      </Card>
    );
  }

  async function handleSend(text?: string) {
    const message = (text ?? draft).trim();
    if (!message) return;
    setBusy(true);
    setError(null);
    try {
      await sendMessage(missionId, message);
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Discovery Discussion" className="shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Badge variant="info">Executive discussion</Badge>
        {currentVersion ? (
          <span className="text-xs text-muted">Brief v{currentVersion}</span>
        ) : null}
      </div>

      {/* Primary workspace: conversation + reply */}
      <section aria-label="Discussion thread" className="space-y-3">
        <div
          className={`rounded-xl border border-border/80 bg-surface/40 p-3 ${DISCUSSION_VIEWPORT_CLASS}`}
        >
          {messages.length > 0 ? (
            <ul className="space-y-3">
              {messages.map((msg) => (
                <DiscussionMessageBubble key={msg.id} msg={msg} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              まだメッセージはありません。製品について何でも聞いてください。
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-accent/20 bg-background p-3 shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            disabled={busy}
            placeholder="例: グラフはMVPに必要ですか？"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
          />
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={() => void handleSend()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_DISCUSSION_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={busy}
                onClick={() => void handleSend(prompt)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:bg-surface hover:text-foreground disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Change notifications — below reply, above review */}
      <section aria-label="Change notifications" className="mt-4 space-y-3">
        {pendingProposals.length > 0 ? (
          <div className="space-y-2">
            {pendingProposals.map((p) => (
              <PendingProposalCard
                key={p.id}
                proposal={p}
                busy={busy}
                onApply={() => applyProposal(missionId, p.id)}
                onDismiss={() => dismissProposal(missionId, p.id)}
              />
            ))}
          </div>
        ) : null}

        {applyFeedback ? (
          <BriefApplyFeedbackBlock
            feedback={applyFeedback}
            onClose={() => clearApplyFeedback(missionId)}
          />
        ) : null}
      </section>

      <hr className="my-6 border-border/70" />

      {/* Secondary: diff review + history */}
      <section aria-label="Brief change review" className="scroll-mt-6 rounded-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Brief Change Review
        </h3>
        {viewDiffVersion != null && pairDiff ? (
          <div className="mt-2 opacity-95">
            <p className="mb-2 text-[11px] text-muted">
              v{pairDiff.diff.fromVersion} → v{pairDiff.diff.toVersion}
            </p>
            <BriefDiffViewer diff={pairDiff.diff} summary={pairDiff.summary} compact />
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Apply a change or pick a version below to review section-level differences.
          </p>
        )}

        <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted/80">
          Version Timeline
        </h3>
        <div className="mt-2 rounded-lg border border-border/50 bg-surface/30 p-2 text-sm opacity-90">
          <BriefHistoryPanel
            versions={run?.briefVersions}
            currentVersion={currentVersion}
            approvedVersion={run?.latestApprovedBriefVersion}
            selectedCompareTo={viewDiffVersion}
            onSelectVersion={(v) => setViewDiffVersion(v)}
          />
        </div>
      </section>
    </Card>
  );
}
