"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import {
  executiveDecisionBadgeVariant,
  executiveDecisionLabel,
} from "@/lib/coo-review/cooReviewTypes";
import {
  getCooReviewReport,
  getExecutiveDecision,
  getPendingDecisionWarning,
  isArchitectUnlocked,
} from "@/lib/coo-review/architectGate";
import { LatestChangesReviewPanel } from "@/components/projects/LatestChangesReviewPanel";
import { useAgentRunsStore } from "@/lib/store/agentRunsStore";
import type { PlannerAgentRun } from "@/lib/agents/planner/plannerTypes";
import type { Mission } from "@/types/productai";

export function CeoDecisionCard({
  mission,
  run,
  missionId,
}: {
  mission: Mission;
  run?: PlannerAgentRun;
  missionId: string;
}) {
  const report = getCooReviewReport(mission, run);
  const decision = getExecutiveDecision(mission, run);
  const submitExecutiveDecision = useAgentRunsStore((s) => s.submitExecutiveDecision);
  const revalidating = Boolean(
    run?.plannerRevalidationInFlight ?? mission.plannerRevalidationInFlight
  );
  const [validationReason, setValidationReason] = useState("");
  const [busy, setBusy] = useState(false);

  if (!report) {
    return (
      <Card title="CEO Decision">
        <p className="text-sm text-muted">
          CEO Decision becomes available after COO Review completes.
        </p>
      </Card>
    );
  }

  const status = decision ?? "awaiting_ceo_approval";
  const pendingDecisionWarning = getPendingDecisionWarning(run);
  const canDecide =
    status === "awaiting_ceo_approval" && !revalidating && !pendingDecisionWarning;
  const architectUnlocked = isArchitectUnlocked(mission, run);

  async function handleAction(action: "approve" | "needs_validation" | "hold") {
    setBusy(true);
    try {
      await submitExecutiveDecision(
        missionId,
        action,
        action === "needs_validation" ? validationReason || undefined : undefined
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="CEO Decision">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge variant={executiveDecisionBadgeVariant(status)}>
          {revalidating
            ? "Needs Validation"
            : canDecide
              ? "Awaiting Approval"
              : executiveDecisionLabel(status)}
        </Badge>
        {architectUnlocked ? (
          <span className="text-xs text-success">Architect unlocked</span>
        ) : (
          <span className="text-xs text-muted">Architect locked</span>
        )}
      </div>

      {pendingDecisionWarning ? (
        <p className="mb-3 rounded-lg border border-warning/30 bg-amber-50/40 px-3 py-2 text-xs text-warning">
          {pendingDecisionWarning}
        </p>
      ) : null}

      <p className="mb-4 text-sm text-muted">
        You are the CEO. The COO recommendation is{" "}
        <strong className="text-foreground">{report.recommendation}</strong> — your decision
        authorizes whether architecture work may begin.
        {pendingDecisionWarning
          ? " Resolve Executive Strategy Room decisions first."
          : null}
      </p>

      {revalidating ? (
        <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground">
          Planner is reviewing your validation request.
        </p>
      ) : null}

      {canDecide && (run?.briefVersion ?? 0) > 1 ? (
        <div className="mb-4">
          <LatestChangesReviewPanel
            briefVersions={run?.briefVersions}
            currentVersion={run?.briefVersion}
            latestApprovedBriefVersion={run?.latestApprovedBriefVersion}
          />
        </div>
      ) : null}

      {canDecide ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAction("approve")}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Approve & Continue
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAction("needs_validation")}
              className="rounded-lg border border-warning/40 bg-amber-50 px-3 py-2 text-xs font-medium text-foreground hover:bg-amber-100/80 disabled:opacity-50"
            >
              Request More Validation
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAction("hold")}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface disabled:opacity-50"
            >
              Put On Hold
            </button>
          </div>
          <p className="text-xs text-muted">
            Ask Planner to revisit the plan before you approve architecture.
          </p>
          <label className="block text-xs text-muted">
            Validation reason
            <textarea
              value={validationReason}
              onChange={(e) => setValidationReason(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="What should the Planner validate before approval?"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-muted">
          {status === "approved" && mission.ceoApprovedAt ? (
            <p>Approved {new Date(mission.ceoApprovedAt).toLocaleString()}</p>
          ) : null}
          {status === "needs_validation" && !revalidating ? (
            <>
              {mission.validationReason ? (
                <p>Validation request: {mission.validationReason}</p>
              ) : null}
              {mission.validationRequestedAt ? (
                <p className="text-xs">
                  Requested {new Date(mission.validationRequestedAt).toLocaleString()}
                </p>
              ) : null}
              <p className="text-foreground">
                COO review will rerun when Planner completes re-validation. CEO approval will be
                requested again.
              </p>
            </>
          ) : null}
          {status === "hold" ? (
            <p>This project is on hold. Architecture and build remain paused.</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
