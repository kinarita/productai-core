import type { ApprovalSignature } from "@/lib/orchestration/execution/executionTypes";

interface ApprovalSignatureViewProps {
  signature: ApprovalSignature;
}

export function ApprovalSignatureView({ signature }: ApprovalSignatureViewProps) {
  const approvedTime = new Date(signature.approvedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-900">
        Approval signature
      </p>
      <p className="mt-1 text-sm text-foreground">
        {signature.actor} <span className="text-muted">({signature.role})</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        {signature.approvalType.replaceAll("_", " ")} · {approvedTime}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{signature.governanceNote}</p>
    </div>
  );
}