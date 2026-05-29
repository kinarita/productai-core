"use client";

import type { ValueProposition } from "@/lib/idea/valueProposition";

export function ValuePropositionPanel({ proposition }: { proposition: ValueProposition }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Detail label="Target User" value={proposition.targetUser} />
      <Detail label="Expected Value" value={proposition.expectedValue} />
      <Detail label="Differentiation" value={proposition.differentiation} />
      <Detail label="Why Now" value={proposition.whyNow} />
      <div className="sm:col-span-2">
        <p className="text-[10px] uppercase text-muted">Success Signals</p>
        <ul className="mt-1 space-y-0.5 text-xs text-muted">
          {proposition.successSignals.map((s) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="mt-1 text-xs text-foreground">{value}</p>
    </div>
  );
}
