"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { MissionFilterBanner } from "@/components/MissionFilterBanner";
import { CreateTaskFromDecisionForm } from "@/components/judgment/CreateTaskFromDecisionForm";
import { useMissionFilterFromUrl } from "@/lib/hooks/useMissionFilterFromUrl";
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
  const updateDecisionStatus = useOrganizationStore((s) => s.updateDecisionStatus);
  const addFeedItem = useOrganizationStore((s) => s.addFeedItem);
  const setSelectedDecision = useUiStore((s) => s.setSelectedDecision);
  const applyJudgmentOutcome = useMissionStore((s) => s.applyJudgmentOutcome);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const addTaskEvent = useTaskStore((s) => s.addTaskEvent);

  const [createFormFor, setCreateFormFor] = useState<string | null>(null);
  const [followUpFormFor, setFollowUpFormFor] = useState<string | null>(null);

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
      type: action === "approved" ? "approval_required" : "coordination",
      author: "COO",
      authorName: "Nova",
      missionId: decision.relatedMissionId,
      missionName: decision.missionName,
      message: resolveDecisionActionMessage(decision, action),
      requiresCeoApproval: false,
    });
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
          {filtered.map((decision) => {
            const isResolved = decision.status !== "pending";
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
