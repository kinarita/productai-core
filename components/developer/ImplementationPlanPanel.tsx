"use client";

import Link from "next/link";
import type { ImplementationPlanRecord } from "@/lib/developer/implementationPlan";

export function ImplementationPlanPanel({ plan }: { plan: ImplementationPlanRecord }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-foreground">{plan.title}</p>
        <Link href={plan.artifactReviewHref} className="text-xs text-accent hover:underline">
          Open Artifact Review →
        </Link>
      </div>
      <Field label="Implementation Summary" value={plan.implementationSummary} />
      <Field label="Frontend Scope" value={plan.frontendScope} />
      <Field label="Backend Scope" value={plan.backendScope} />
      <Field label="Database Scope" value={plan.databaseScope} />
      <Field label="AI Scope" value={plan.aiScope} />
      <Field label="Integration Scope" value={plan.integrationScope} />
      <p className="text-[10px] text-muted">Display only—no code generation.</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="text-xs text-foreground">{value}</p>
    </div>
  );
}
