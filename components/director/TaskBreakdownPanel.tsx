"use client";

import type { TaskBreakdownRow } from "@/lib/director/taskBreakdown";

export function TaskBreakdownPanel({ rows }: { rows: TaskBreakdownRow[] }) {
  if (!rows.length) {
    return (
      <p className="text-xs text-muted">
        No existing tasks for this mission. Task auto-generation is not performed—tasks appear when
        already linked to the mission.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-2 pr-3 font-medium">Task Name</th>
            <th className="py-2 pr-3 font-medium">Role</th>
            <th className="py-2 pr-3 font-medium">Stage</th>
            <th className="py-2 pr-3 font-medium">Dependency</th>
            <th className="py-2 font-medium">Review Required</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.taskId} className="border-b border-border/60">
              <td className="py-2 pr-3 text-foreground">{row.taskName}</td>
              <td className="py-2 pr-3">{row.role}</td>
              <td className="py-2 pr-3">{row.stage}</td>
              <td className="py-2 pr-3 text-muted">{row.dependency}</td>
              <td className="py-2">{row.reviewRequired ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-muted">
        Existing tasks organized for planning—no automatic task creation.
      </p>
    </div>
  );
}
