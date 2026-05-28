import type { ExecutionAuthorizationSignature } from "@/lib/orchestration/authorization/authorizationTypes";

export function AuthorizationSignatureView({ signature }: { signature: ExecutionAuthorizationSignature }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-900">
        Authorization signature
      </p>
      <p className="mt-1 text-sm text-foreground">
        {signature.actor} <span className="text-muted">({signature.role})</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        {signature.authorizationType.replaceAll("_", " ")} ·{" "}
        {new Date(signature.authorizedAt).toLocaleString()}
      </p>
      <p className="mt-2 text-xs text-muted">{signature.authorizationNote}</p>
    </div>
  );
}
