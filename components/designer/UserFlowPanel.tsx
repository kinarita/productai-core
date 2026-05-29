"use client";

import type { UserFlowRecord } from "@/lib/designer/userFlow";

export function UserFlowPanel({ flow }: { flow: UserFlowRecord }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium text-foreground">{flow.title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Target User</p>
          <p className="text-xs">{flow.targetUser}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Entry Point</p>
          <p className="text-xs">{flow.entryPoint}</p>
        </div>
      </div>
      <FlowSection title="Primary Flow" steps={flow.primaryFlow} />
      <FlowSection title="Alternative Flows" steps={flow.alternativeFlows} />
      <FlowSection title="Exit Points" steps={flow.exitPoints} />
      <p className="text-[10px] text-muted">Card format only—no diagram generation.</p>
    </div>
  );
}

function FlowSection({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <ol className="mt-2 list-decimal space-y-2 pl-4 text-xs text-muted">
        {steps.map((step, i) => (
          <li key={`${title}-${i}`}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
