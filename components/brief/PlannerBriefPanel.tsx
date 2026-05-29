"use client";

import Link from "next/link";
import type { PlannerBriefView } from "@/lib/brief/productBriefAnalysis";

export function PlannerBriefPanel({ view }: { view: PlannerBriefView }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{view.advisoryNote}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Bucket title="Active Briefs" count={view.activeBriefs.length} />
        <Bucket title="Review Requests" count={view.reviewRequests.length} />
        <Bucket title="Pending Questions" count={view.pendingQuestions.length} />
        <Bucket title="Approved Briefs" count={view.approvedBriefs.length} />
      </div>
      <Link href="/product-brief" className="inline-block text-xs text-accent hover:underline">
        Open Product Brief Workspace
      </Link>
    </div>
  );
}

function Bucket({ title, count }: { title: string; count: number }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[10px] uppercase text-muted">{title}</p>
      <p className="text-lg font-semibold">{count}</p>
    </div>
  );
}
