"use client";

import type { DevelopmentIntakeView } from "@/lib/qa/qaAnalysis";

export function DevelopmentIntakePanel({ intake }: { intake: DevelopmentIntakeView }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg border border-border px-3 py-2">
        <p className="text-[10px] uppercase text-muted">Mission</p>
        <p className="text-lg font-semibold text-foreground">{intake.missionName}</p>
        <p className="mt-1 text-xs text-muted">{intake.implementationSummary}</p>
      </div>

      <ScopeBlock label="Frontend Scope" value={intake.frontendScope} />
      <ScopeBlock label="Backend Scope" value={intake.backendScope} />
      <ScopeBlock label="Database Scope" value={intake.databaseScope} />
      <ScopeBlock label="AI Scope" value={intake.aiScope} />

      <div>
        <p className="text-xs font-medium text-foreground">Technical Risks (from Developer)</p>
        <ul className="mt-1 list-inside list-disc text-xs text-muted">
          {intake.technicalRisks.map((risk, i) => (
            <li key={`${intake.missionId}-risk-${i}`}>{risk}</li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] text-muted">
        Display only. QA uses this as planning input—no test execution is performed in ProductAI.
      </p>
    </div>
  );
}

function ScopeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted">{value}</p>
    </div>
  );
}

