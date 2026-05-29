"use client";

import Link from "next/link";
import type { DirectorBriefView } from "@/lib/brief/productBriefAnalysis";

export function DirectorBriefPanel({ view }: { view: DirectorBriefView }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{view.advisoryNote}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Handoff Ready</p>
          <p className="text-lg font-semibold">{view.handoffReadyBriefs.length}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Approved</p>
          <p className="text-lg font-semibold">{view.approvedBriefs.length}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Planning Queue</p>
          <p className="text-lg font-semibold">{view.planningQueue.length}</p>
        </div>
      </div>
      {view.handoffReadyBriefs.length > 0 ? (
        <ul className="space-y-2">
          {view.handoffReadyBriefs.map((b) => (
            <li key={b.briefId} className="rounded-lg border border-accent/30 px-3 py-2 text-xs">
              <Link
                href={`/product-brief?brief=${b.briefId}`}
                className="font-medium text-accent hover:underline"
              >
                {b.title}
              </Link>
              <p className="mt-1 text-muted">Director Handoff Ready</p>
            </li>
          ))}
        </ul>
      ) : null}
      <Link href="/product-brief" className="inline-block text-xs text-accent hover:underline">
        Open Product Brief Workspace
      </Link>
    </div>
  );
}
