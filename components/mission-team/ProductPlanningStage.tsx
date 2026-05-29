"use client";

import type { Mission } from "@/types/productai";
import { buildPlanningFlowStatus, planningFlowSteps } from "@/lib/mission-team/planningFlow";

export function ProductPlanningStage({ mission }: { mission: Mission }) {
  const status = buildPlanningFlowStatus(mission);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{status.advisoryNote}</p>
      <p className="text-xs text-foreground">{status.progressLabel}</p>
      <ul className="space-y-2 border-l border-border pl-3">
        {planningFlowSteps.map((step) => (
          <li
            key={step.id}
            className={`relative text-xs ${step.id === status.activeStep.id ? "text-foreground" : "text-muted"}`}
          >
            <span className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-border" />
            <p className="font-medium">{step.title}</p>
            <p>{step.description}</p>
            <p className="text-[11px]">Artifact: {step.artifact}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
