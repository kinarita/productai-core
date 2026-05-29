"use client";

import Link from "next/link";
import type { Mission } from "@/types/productai";
import { buildDirectorFlowStatus, directorFlowSteps } from "@/lib/mission-team/directorFlow";
import { buildDirectorBriefView, buildProductBriefRecords } from "@/lib/brief/productBriefAnalysis";

export function DirectorCoordinationStage({
  mission,
  missions = [],
}: {
  mission: Mission;
  missions?: Mission[];
}) {
  const status = buildDirectorFlowStatus(mission);
  const directorBriefs = buildDirectorBriefView(buildProductBriefRecords(missions.length ? missions : [mission]));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{status.advisoryNote}</p>
      <p className="text-xs text-foreground">{status.progressLabel}</p>
      <ul className="space-y-2 border-l border-border pl-3">
        {directorFlowSteps.map((step) => (
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
      {directorBriefs.handoffReadyBriefs.length > 0 ? (
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-xs font-medium text-foreground">Director Handoff Ready Briefs</p>
          <ul className="mt-1 space-y-1 text-xs text-muted">
            {directorBriefs.handoffReadyBriefs.map((b) => (
              <li key={b.briefId}>
                <Link href={`/product-brief?brief=${b.briefId}`} className="text-accent hover:underline">
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/product-brief" className="mt-2 inline-block text-[10px] text-accent hover:underline">
            Open Product Brief Workspace
          </Link>
        </div>
      ) : null}
    </div>
  );
}
