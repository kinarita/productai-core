import type { RoleResponsibilityDetail } from "@/lib/mission-team/roleResponsibilities";

export function RoleResponsibilityCard({
  detail,
  compact = false,
}: {
  detail: RoleResponsibilityDetail;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <p className="text-sm font-medium text-foreground">{detail.title}</p>
      {!compact ? (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {detail.responsibilities.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-[11px] font-medium uppercase text-muted">Deliverables</p>
      <p className="text-xs text-muted">{detail.deliverables.join(" · ")}</p>
      {detail.coordinationNote ? (
        <p className="mt-2 text-[11px] text-muted">{detail.coordinationNote}</p>
      ) : null}
    </div>
  );
}
