"use client";

import type { OutcomeSignal } from "@/lib/outcome/outcomeSignals";
import { Badge } from "@/components/Badge";

export function OutcomeSignalsPanel({
  signals,
  compact = false,
}: {
  signals: OutcomeSignal[];
  compact?: boolean;
}) {
  if (signals.length === 0) {
    return (
      <p className="text-xs text-muted">
        No outcome signals recorded yet. Additional feedback may improve outcome visibility.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {signals.slice(0, compact ? 3 : undefined).map((signal) => (
        <li key={signal.id} className="rounded-lg border border-border px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{signal.typeLabel}</Badge>
            <span className="text-[10px] text-muted">{signal.source}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{signal.message}</p>
          <p className="mt-1 text-[10px] text-muted">{signal.timestamp}</p>
        </li>
      ))}
    </ul>
  );
}
