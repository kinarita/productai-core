"use client";

import type { HandoffArtifact } from "@/lib/handoff/handoffArtifacts";
import { RoleArtifactCard } from "@/components/handoff/RoleArtifactCard";

type StatusBoard = ReturnType<
  typeof import("@/lib/handoff/handoffAnalysis").buildHandoffStatusBoard
>;

export function HandoffStatusBoard({
  board,
  compact = false,
}: {
  board: StatusBoard;
  compact?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {board.map((bucket) => (
        <div key={bucket.status} className="rounded-lg border border-border px-3 py-2">
          <p className="text-[10px] font-medium uppercase text-muted">{bucket.title}</p>
          <p className="mt-1 text-lg font-semibold">{bucket.artifacts.length}</p>
          {!compact && bucket.artifacts.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {bucket.artifacts.slice(0, 3).map((a: HandoffArtifact) => (
                <li key={a.id}>
                  <RoleArtifactCard artifact={a} compact />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
