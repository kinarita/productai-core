"use client";

import {
  matrixRoles,
  type RoleReviewMatrixCell,
  type MatrixRoleId,
} from "@/lib/cross-review/crossRoleReviewAnalysis";

export function RoleReviewMatrixPanel({
  matrix,
}: {
  matrix: Record<MatrixRoleId, RoleReviewMatrixCell>;
}) {
  const columns = [
    { key: "requested" as const, label: "Reviews Requested" },
    { key: "inProgress" as const, label: "Reviews In Progress" },
    { key: "completed" as const, label: "Reviews Completed" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Review load by role—visibility only, no automatic prioritization.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-xs">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="px-2 py-2 text-left font-medium">Role</th>
              {columns.map((c) => (
                <th key={c.key} className="px-2 py-2 text-center font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixRoles.map((role) => (
              <tr key={role.id} className="border-b border-border/60">
                <td className="px-2 py-2 font-medium">{role.label}</td>
                {columns.map((c) => (
                  <td key={c.key} className="px-2 py-2 text-center">
                    {matrix[role.id][c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
