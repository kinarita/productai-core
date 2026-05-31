"use client";

import {
  STRATEGY_SIGNAL_LABELS,
  type StrategySignal,
} from "@/lib/discussion/strategyRoomTypes";

export function StrategySignalsPanel({ signals }: { signals: StrategySignal[] }) {
  if (!signals.length) {
    return (
      <div className="rounded-lg border border-border/60 bg-surface/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Strategy Signals
        </p>
        <p className="mt-2 text-xs text-muted">
          Signals appear when the discussion surfaces scope, insight, or risk themes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
        Strategy Signals
      </p>
      <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
        {[...signals].reverse().slice(0, 8).map((sig) => (
          <li key={sig.id} className="rounded-md border border-border/50 bg-background px-2 py-1.5">
            <p className="text-[10px] font-medium uppercase text-accent">
              {STRATEGY_SIGNAL_LABELS[sig.kind]}
            </p>
            <p className="text-xs font-medium text-foreground">{sig.title}</p>
            <p className="mt-0.5 text-[11px] text-muted">{sig.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
