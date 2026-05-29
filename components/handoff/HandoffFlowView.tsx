"use client";

import Link from "next/link";
import type { HandoffRoleId } from "@/lib/handoff/handoffWorkflow";
import { handoffRoleLabel } from "@/lib/handoff/handoffWorkflow";
import { useHandoffWorkspaceStore } from "@/lib/store/handoffWorkspaceStore";
import { RoleArtifactCard } from "@/components/handoff/RoleArtifactCard";
import { cn } from "@/lib/utils";

type FlowView = ReturnType<
  typeof import("@/lib/handoff/handoffAnalysis").buildHandoffFlowView
>;

export function HandoffFlowView({
  flow,
  compact = false,
}: {
  flow: FlowView;
  compact?: boolean;
}) {
  const selectedRole = useHandoffWorkspaceStore((s) => s.selectedRole);
  const setSelectedRole = useHandoffWorkspaceStore((s) => s.setSelectedRole);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        CEO Idea through Release—each role receives context, produces artifacts, and passes work forward.
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {flow.map((step, index) => (
          <div key={step.role} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setSelectedRole(
                  selectedRole === step.role ? null : (step.role as HandoffRoleId)
                )
              }
              className={cn(
                "rounded-lg border px-2 py-1.5 text-left transition",
                selectedRole === step.role
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/40",
                step.missionCount > 0 && "ring-1 ring-accent/10"
              )}
            >
              <p className="text-[10px] font-medium uppercase text-muted">{step.title}</p>
              {!compact ? (
                <p className="mt-0.5 text-[11px] text-foreground">{step.missionCount} mission(s)</p>
              ) : null}
            </button>
            {index < flow.length - 1 ? <span className="text-muted">↓</span> : null}
          </div>
        ))}
      </div>
      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {flow
            .filter((s) => !selectedRole || s.role === selectedRole)
            .map((step) => (
              <div key={step.role} className="rounded-lg border border-border px-3 py-2">
                <p className="text-xs font-medium">{step.title}</p>
                <p className="mt-1 text-[11px] text-muted">{step.description}</p>
                {step.primaryArtifacts.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {step.primaryArtifacts.slice(0, 2).map((a) => (
                      <li key={a.id}>
                        <RoleArtifactCard artifact={a} compact />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] text-muted">No active primary artifacts.</p>
                )}
                {step.handsOffTo ? (
                  <p className="mt-2 text-[10px] text-muted">
                    Hands off to {handoffRoleLabel(step.handsOffTo)}
                  </p>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}

export function CooHandoffCoordinationPanel({
  coordination,
}: {
  coordination: ReturnType<
    typeof import("@/lib/handoff/handoffAnalysis").buildCooHandoffCoordination
  >;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{coordination.advisoryNote}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Review Concentration</p>
          <p className="text-lg font-semibold">{coordination.reviewConcentration}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Pending Handoffs</p>
          <p className="text-lg font-semibold">{coordination.pendingHandoffs}</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] uppercase text-muted">Active Roles</p>
          <p className="text-lg font-semibold">{coordination.roleQueue.length}</p>
        </div>
      </div>
      {coordination.roleQueue.length > 0 ? (
        <div>
          <p className="text-xs font-medium uppercase text-muted">Role Queue</p>
          <ul className="mt-1 space-y-1">
            {coordination.roleQueue.map((r) => (
              <li key={r.role} className="text-xs text-muted">
                · {r.roleLabel}: {r.missionCount} mission(s)
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link href="/team-handoff" className="inline-block text-xs text-accent hover:underline">
        Open Team Handoff Workspace
      </Link>
    </div>
  );
}
