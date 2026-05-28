"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { MissionFilterBanner } from "@/components/MissionFilterBanner";
import { CreateTaskFromDecisionForm } from "@/components/judgment/CreateTaskFromDecisionForm";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import type { JudgmentRecommendation } from "@/lib/orchestration/orchestrationTypes";
import { useMissionFilterFromUrl } from "@/lib/hooks/useMissionFilterFromUrl";
import { buildOrchestrationContext } from "@/lib/orchestration/contextBuilder";
import { getProductAIOrchestrator } from "@/lib/orchestration/orchestrator";
import {
  resolveDecisionActionMessage,
  useOrganizationStore,
} from "@/lib/store/organizationStore";
import { useUiStore } from "@/lib/store/uiStore";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { getLinkedTasksForDecision } from "@/lib/task/taskSelectors";
import type { DecisionStatus } from "@/types/productai";
import { Check, Plus, RotateCcw, X } from "lucide-react";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useProcessingStore } from "@/lib/store/processingStore";
import { buildGovernanceReplay } from "@/lib/orchestration/governance-history/governanceReplay";
import { parseReplayQuery } from "@/lib/replay-query/replayQueryParser";
import { GovernanceExplainabilityCard } from "@/components/orchestration/GovernanceExplainabilityCard";
import { buildProcessingAnalytics } from "@/lib/orchestration/processing/processingAnalytics";
import { DecisionWorkflowSummary } from "@/components/orchestration/DecisionWorkflowSummary";
import { buildDecisionAttentionQueue } from "@/lib/orchestration/decision-attention/decisionAttention";

const statusVariant = {
  pending: "warning" as const,
  approved: "success" as const,
  rejected: "danger" as const,
};

interface JudgmentViewProps {
  missionFilter?: string;
}

export function JudgmentView({ missionFilter }: JudgmentViewProps) {
  useMissionFilterFromUrl(missionFilter);

  const decisions = useOrganizationStore((s) => s.decisions);
  const tasks = useTaskStore((s) => s.tasks);
  const updateDecisionStatus = useOrganizationStore((s) => s.updateDecisionStatusWithSync);
  const addFeedItem = useOrganizationStore((s) => s.addFeedItemWithSync);
  const setSelectedDecision = useUiStore((s) => s.setSelectedDecision);
  const applyJudgmentOutcome = useMissionStore((s) => s.applyJudgmentOutcome);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatusWithSync);
  const addTaskEvent = useTaskStore((s) => s.addTaskEventWithSync);

  const [createFormFor, setCreateFormFor] = useState<string | null>(null);
  const [followUpFormFor, setFollowUpFormFor] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, JudgmentRecommendation>>({});
  const runtimeAlerts = useRuntimeStore((s) => s.alerts);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const processingSessions = useProcessingStore((s) => s.getSessions());
  const processingAuditTrail = useProcessingStore((s) => s.getAuditTrail());
  const replayQuery = useMemo(
    () =>
      parseReplayQuery(
        typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search)
      ),
    []
  );
  const filteredProcessingSessions = useMemo(
    () =>
      processingSessions.filter((session) =>
        missionFilter ? session.missionId === missionFilter : true
      ),
    [missionFilter, processingSessions]
  );
  const replay = useMemo(
    () =>
      buildGovernanceReplay({
        processingSessions: filteredProcessingSessions,
        processingAuditTrail,
        feedItems: useOrganizationStore.getState().organizationFeedItems,
        runtimeAlerts,
        syncWarnings,
        replayQuery: missionFilter ? { ...replayQuery, mission: missionFilter } : replayQuery,
      }),
    [
      filteredProcessingSessions,
      missionFilter,
      processingAuditTrail,
      replayQuery,
      runtimeAlerts,
      syncWarnings,
    ]
  );
  const processingAnalytics = useMemo(
    () => buildProcessingAnalytics(filteredProcessingSessions),
    [filteredProcessingSessions]
  );
  const decisionAttentionItems = useMemo(
    () =>
      buildDecisionAttentionQueue({
        replayDiagnostics: replay.diagnostics,
        memoryItems: replay.memoryItems,
        processingSessions: filteredProcessingSessions,
        runtimeAlerts,
        replayQuery: missionFilter ? { ...replayQuery, mission: missionFilter } : replayQuery,
      }),
    [
      filteredProcessingSessions,
      missionFilter,
      replay.diagnostics,
      replay.memoryItems,
      replayQuery,
      runtimeAlerts,
    ]
  );

  const filtered = missionFilter
    ? decisions.filter((d) => d.relatedMissionId === missionFilter)
    : decisions;

  const handleAction = (
    decisionId: string,
    action: "approved" | "rejected" | "revision"
  ) => {
    const decision = decisions.find((d) => d.id === decisionId);
    if (!decision) return;

    const status: DecisionStatus =
      action === "approved" ? "approved" : action === "rejected" ? "rejected" : "pending";

    updateDecisionStatus(decisionId, status);
    setSelectedDecision(decisionId);
    applyJudgmentOutcome(decision.relatedMissionId, action);

    if (decision.relatedTaskIds?.length) {
      decision.relatedTaskIds.forEach((taskId) => {
        if (action === "approved") {
          updateTaskStatus(taskId, "active");
          addTaskEvent(taskId, {
            type: "status_change",
            actor: "COO",
            message: `CEO approval unblocked execution for "${decision.title}".`,
            source: "judgment",
          });
          return;
        }
        if (action === "rejected") {
          updateTaskStatus(taskId, "blocked");
          addTaskEvent(taskId, {
            type: "revision_requested",
            actor: "COO",
            message: `CEO rejected decision "${decision.title}" — task blocked pending follow-up.`,
            source: "judgment",
          });
          return;
        }
        addTaskEvent(taskId, {
          type: "revision_requested",
          actor: "COO",
          message: `CEO requested revision on "${decision.title}".`,
          source: "judgment",
        });
        updateTaskStatus(taskId, "active");
      });
    }

    addFeedItem({
      type: "judgment",
      author: "COO",
      authorName: "Nova",
      missionId: decision.relatedMissionId,
      missionName: decision.missionName,
      decisionId: decision.id,
      status,
      message: resolveDecisionActionMessage(decision, action),
      requiresCeoApproval: false,
    });
  };

  const handleRecommendation = async (decisionId: string) => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const recommendation = await orchestrator.reviewDecision(decisionId, context);
    setRecommendations((prev) => ({
      ...prev,
      [decisionId]: recommendation,
    }));
  };

  return (
    <AppShell
      title="Judgment Center"
      description="Human decision authority — review and approve organizational choices"
    >
      {missionFilter && (
        <MissionFilterBanner missionId={missionFilter} basePath="/judgment" />
      )}

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            No decisions match this mission filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Decision Context Summary</p>
            <p className="mt-2 text-xs text-muted">{replay.diagnostics.visibilityExplanation}</p>
            <p className="mt-1 text-xs text-muted">{replay.diagnostics.confidenceExplanation}</p>
            <GovernanceExplainabilityCard
              explanation={processingAnalytics.continuityExplanation}
              breakdown={processingAnalytics.scoreBreakdown}
              replayDiagnostics={replay.diagnostics}
              scope={replayQuery.scope}
              replayWindow={replayQuery.replayWindow}
              compact
            />
            <div className="mt-3">
              <DecisionWorkflowSummary items={decisionAttentionItems} />
            </div>
          </Card>
          {filtered.map((decision) => {
            const isResolved = decision.status !== "pending";
            const aiRecommendation = recommendations[decision.id];
            const linkedTasks = getLinkedTasksForDecision(
              tasks,
              decision.id,
              decision.relatedTaskIds
            );

            return (
              <Card
                key={decision.id}
                className={isResolved ? "opacity-90" : undefined}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {decision.title}
                      </h3>
                      <Badge variant={decision.priority === "high" ? "danger" : "warning"}>
                        {decision.priority}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <MissionLink
                        missionId={decision.relatedMissionId}
                        missionName={decision.missionName}
                        variant="link"
                      />
                      <span className="text-xs text-muted">·</span>
                      <MissionLink
                        missionId={decision.relatedMissionId}
                        variant="subtle"
                      >
                        View Mission →
                      </MissionLink>
                    </div>
                  </div>
                  <Badge variant={statusVariant[decision.status]}>{decision.status}</Badge>
                </div>

                <p className="mt-4 text-sm text-muted">{decision.summary}</p>

                <div className="mt-4 rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase text-muted">AI Recommendation</p>
                    <button
                      type="button"
                      onClick={() => void handleRecommendation(decision.id)}
                      className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      Generate Recommendation
                    </button>
                  </div>
                  {aiRecommendation ? (
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-foreground">
                        Recommended option:{" "}
                        <span className="font-medium">
                          {aiRecommendation.recommendedOption === "optionA"
                            ? decision.optionA.label
                            : decision.optionB.label}
                        </span>
                      </p>
                      <p className="text-muted">{aiRecommendation.rationale}</p>
                      <p className="text-muted">Execution risk: {aiRecommendation.executionRisk}</p>
                      <ul className="space-y-1">
                        {aiRecommendation.dependencyConcerns.map((concern) => (
                          <li key={concern} className="text-muted">
                            · {concern}
                          </li>
                        ))}
                      </ul>
                      {aiRecommendation.governanceNote ? (
                        <div className="mt-3 space-y-2">
                          <GovernanceNote>{aiRecommendation.governanceNote}</GovernanceNote>
                          {aiRecommendation.executionImpact ? (
                            <p className="text-xs text-muted">
                              Execution impact: {aiRecommendation.executionImpact}
                            </p>
                          ) : null}
                          {aiRecommendation.approvalBoundary ? (
                            <p className="text-xs text-muted">
                              Policy boundary: {aiRecommendation.approvalBoundary}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      Generate operational recommendation to support CEO judgment.
                    </p>
                  )}
                </div>

                {linkedTasks.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs">
                    <span className="text-muted">
                      <span className="font-medium text-foreground">{linkedTasks.length}</span> linked
                      task{linkedTasks.length === 1 ? "" : "s"}
                    </span>
                    <Link
                      href={`/tasks?mission=${decision.relatedMissionId}`}
                      className="font-medium text-accent hover:underline"
                    >
                      Open Tasks →
                    </Link>
                  </div>
                ) : null}

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs font-medium uppercase text-muted">Option A</p>
                    <p className="mt-1 font-medium text-foreground">{decision.optionA.label}</p>
                    <p className="mt-1 text-sm text-muted">{decision.optionA.description}</p>
                  </div>
                  <div className="rounded-lg border border-accent/30 bg-indigo-50/30 p-4">
                    <p className="text-xs font-medium uppercase text-accent">Option B</p>
                    <p className="mt-1 font-medium text-foreground">{decision.optionB.label}</p>
                    <p className="mt-1 text-sm text-muted">{decision.optionB.description}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted">Risk Analysis</p>
                    <ul className="mt-2 space-y-1">
                      {decision.risks.map((r) => (
                        <li key={r} className="text-sm text-foreground">
                          · {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted">Cost Impact</p>
                    <p className="mt-2 text-sm text-foreground">{decision.costImpact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted">Time Impact</p>
                    <p className="mt-2 text-sm text-foreground">{decision.timeImpact}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-medium uppercase text-muted">AI Team Opinions</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {decision.teamOpinions.map((op) => (
                      <div
                        key={op.role}
                        className="rounded-lg border border-border bg-surface p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{op.role}</span>
                          <Badge
                            variant={
                              op.stance === "support"
                                ? "success"
                                : op.stance === "concern"
                                  ? "warning"
                                  : "muted"
                            }
                          >
                            {op.stance}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted">{op.opinion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setFollowUpFormFor(null);
                      setCreateFormFor(
                        createFormFor === decision.id ? null : decision.id
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-surface"
                  >
                    <Plus className="h-4 w-4" />
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateFormFor(null);
                      setFollowUpFormFor(
                        followUpFormFor === decision.id ? null : decision.id
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    <Plus className="h-4 w-4" />
                    Create Follow-up Task
                  </button>
                </div>

                {createFormFor === decision.id ? (
                  <CreateTaskFromDecisionForm
                    decision={decision}
                    onCancel={() => setCreateFormFor(null)}
                    onCreated={() => setCreateFormFor(null)}
                  />
                ) : null}

                {followUpFormFor === decision.id ? (
                  <CreateTaskFromDecisionForm
                    decision={decision}
                    isFollowUp
                    onCancel={() => setFollowUpFormFor(null)}
                    onCreated={() => setFollowUpFormFor(null)}
                  />
                ) : null}

                {!isResolved && (
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
                    <button
                      type="button"
                      onClick={() => handleAction(decision.id, "approved")}
                      className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(decision.id, "rejected")}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(decision.id, "revision")}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Request Revision
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
