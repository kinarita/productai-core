"use client";

import { pendingDecisionsBannerMessage } from "@/lib/discussion/executiveRoomLabels";

export function PendingDecisionsBanner({ pendingCount }: { pendingCount: number }) {
  const message = pendingDecisionsBannerMessage(pendingCount);
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-warning/35 bg-amber-50/50 px-3 py-2.5 text-xs font-medium text-warning"
    >
      {message}
    </div>
  );
}
