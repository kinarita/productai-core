"use client";

import type { ReviewConcentrationView } from "@/lib/cross-review/crossRoleReviewAnalysis";

export function ReviewConcentrationPanel({ view }: { view: ReviewConcentrationView }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-medium uppercase text-muted">Reviews by Role</p>
        <ul className="mt-1 space-y-1">
          {view.byRole.length ? (
            view.byRole.map((r) => (
              <li key={r.role} className="text-xs text-muted">
                · {r.role}: {r.count}
              </li>
            ))
          ) : (
            <li className="text-xs text-muted">No active reviews by role.</li>
          )}
        </ul>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted">Reviews by Mission</p>
        <ul className="mt-1 space-y-2">
          {view.byMission.length ? (
            view.byMission.map((m) => (
              <li key={m.missionId} className="rounded-lg border border-border px-3 py-2 text-xs">
                <p className="font-medium text-foreground">
                  {m.missionName} ({m.count})
                </p>
                <p className="mt-1 text-muted">{m.note}</p>
              </li>
            ))
          ) : (
            <li className="text-xs text-muted">No mission concentrations in view.</li>
          )}
        </ul>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-muted">Reviews by Artifact Type</p>
        <ul className="mt-1 space-y-1">
          {view.byArtifactType.length ? (
            view.byArtifactType.map((t) => (
              <li key={t.type} className="text-xs text-muted">
                · {t.type}: {t.count}
              </li>
            ))
          ) : (
            <li className="text-xs text-muted">No artifact type concentrations.</li>
          )}
        </ul>
      </div>
      <p className="text-xs text-muted">{view.advisoryNote}</p>
    </div>
  );
}
