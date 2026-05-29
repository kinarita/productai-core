"use client";

import type { DeliveryPlanView } from "@/lib/director/deliveryPlan";
import { cn } from "@/lib/utils";

export function DeliveryPlanPanel({ plan }: { plan: DeliveryPlanView }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-medium text-foreground">Delivery Phases</p>
        <ul className="mt-2 space-y-2">
          {plan.phases.map((phase) => (
            <li
              key={phase.id}
              className={cn(
                "rounded-lg border border-border px-3 py-2 text-xs",
                phase.status === "active" && "border-accent/40 bg-accent/5",
                phase.status === "completed" && "opacity-80"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{phase.label}</span>
                <span className="text-[10px] uppercase text-muted">{phase.status}</span>
              </div>
              <p className="mt-1 text-muted">{phase.note}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Milestones</p>
        <ul className="mt-2 space-y-2">
          {plan.milestones.map((m) => (
            <li key={m.label} className="rounded-lg border border-border px-3 py-2 text-xs">
              <p className="font-medium">{m.label}</p>
              <p className="text-muted">Target: {m.target}</p>
              <p className="text-muted">{m.note}</p>
            </li>
          ))}
        </ul>
      </div>
      <ListSection title="Target Reviews" items={plan.targetReviews} />
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Release Goal</p>
        <p className="text-xs">{plan.releaseGoal}</p>
      </div>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{title}</p>
      <ul className="mt-1 list-inside list-disc text-xs text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
