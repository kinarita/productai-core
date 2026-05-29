"use client";

import Link from "next/link";
import type { Mission, PullRequest, ReleaseItem, Task } from "@/types/productai";
import { buildQaMissionContext } from "@/lib/qa/qaAnalysis";

export function MissionQualityContextPanel({
  mission,
  missions,
  tasks,
  pullRequests,
  releases,
}: {
  mission: Mission;
  missions: Mission[];
  tasks: Task[];
  pullRequests: PullRequest[];
  releases: ReleaseItem[];
}) {
  const ctx = buildQaMissionContext({ mission, missions, tasks, pullRequests, releases });

  if (!ctx) {
    return (
      <p className="text-xs text-muted">
        QA context is not available yet. Confirm Developer planning artifacts first.
      </p>
    );
  }

  const checklistStatuses = Object.values(ctx.checklist).map((i) => i.status);
  const completed = checklistStatuses.filter((s) => s === "completed").length;
  const inReview = checklistStatuses.filter((s) => s === "in_review").length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{ctx.readiness.recommendation}</p>

      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">QA Readiness</p>
        <p className="text-sm font-medium">{ctx.readiness.statusLabel}</p>
        <p className="mt-1 text-xs text-muted">
          Checklist: {completed} completed · {inReview} in review
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Test Plan</p>
          <p className="text-xs text-muted">{ctx.testPlan.title}</p>
          <Link href={ctx.upstreamLinks.testPlanReviewHref} className="mt-1 inline-block text-xs text-accent hover:underline">
            Open Test Plan Review
          </Link>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Acceptance Criteria</p>
          <p className="text-xs text-muted">{ctx.acceptance[0]?.criterion ?? "—"}</p>
          <Link href={`/qa-workspace?mission=${mission.id}`} className="mt-1 inline-block text-xs text-accent hover:underline">
            Open QA Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

