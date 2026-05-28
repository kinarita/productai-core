import type { ExecutionOperatorSignature } from "@/lib/orchestration/execution-start/executionStartTypes";

export function ExecutionOperatorSignatureView({ signature }: { signature?: ExecutionOperatorSignature }) {
  if (!signature) return null;
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-900">Execution operator signature</p>
      <p className="mt-1 text-sm text-foreground">
        {signature.actor} <span className="text-muted">({signature.role})</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        boundary accepted: {signature.governanceBoundaryAccepted ? "yes" : "no"} ·{" "}
        {new Date(signature.signedAt).toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-muted">{signature.operatorNote}</p>
    </div>
  );
}
