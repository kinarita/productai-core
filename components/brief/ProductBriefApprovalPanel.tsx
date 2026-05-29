"use client";

import type { ProductBriefApprovalContext } from "@/lib/brief/productBriefApproval";
import { ceoBriefActions } from "@/lib/brief/productBriefApproval";
import { cn } from "@/lib/utils";

export function ProductBriefApprovalPanel({
  context,
}: {
  context: ProductBriefApprovalContext;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Approval Status</p>
          <p className="text-sm">{context.approvalStatus}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Recommended Handoff Readiness</p>
          <p className="text-xs text-muted">{context.directorReadiness.recommendedHandoffReadiness}</p>
        </div>
      </div>

      {context.approvalNotes.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Approval Notes</p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted">
            {context.approvalNotes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium uppercase text-muted">Approval Timeline</p>
        <ol className="mt-2 space-y-2">
          {context.approvalTimeline.map((step) => (
            <li key={step.label} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  step.status === "completed" && "bg-success",
                  step.status === "upcoming" && "bg-border"
                )}
              />
              <span className="font-medium">{step.label}</span>
              <span className="text-muted">· {step.at}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-muted/5 px-3 py-3">
        <p className="text-xs font-medium uppercase text-muted">Director Readiness</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Detail label="Planning Completeness" value={context.directorReadiness.planningCompleteness} />
          <Detail label="Open Questions" value={context.directorReadiness.openQuestions} />
          <Detail label="Review Status" value={context.directorReadiness.reviewStatus} />
          <Detail label="Approval Status" value={context.directorReadiness.approvalStatus} />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted">CEO Actions (visualization only)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ceoBriefActions.map((action) => (
            <div
              key={action.id}
              className="rounded-lg border border-border px-3 py-2 text-xs"
              title={action.description}
            >
              <p className="font-medium text-foreground">{action.label}</p>
              <p className="mt-0.5 text-[10px] text-muted">{action.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="text-xs text-foreground">{value}</p>
    </div>
  );
}
