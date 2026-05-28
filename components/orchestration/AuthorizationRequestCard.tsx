"use client";

import { AuthorizationStatusBadge } from "@/components/orchestration/AuthorizationStatusBadge";
import { ExecutionIntentReview } from "@/components/orchestration/ExecutionIntentReview";
import type {
  ExecutionAuthorizationRequest,
  ExecutionAuthorizationSignature,
  AuthorizationAuditEntry,
} from "@/lib/orchestration/authorization/authorizationTypes";
import type { ExecutionQueueItem } from "@/lib/orchestration/queue/executionQueueTypes";
import { AuthorizationSignatureView } from "@/components/orchestration/AuthorizationSignatureView";

export function AuthorizationRequestCard({
  item,
  request,
  signature,
  auditEntries,
}: {
  item: ExecutionQueueItem;
  request?: ExecutionAuthorizationRequest;
  signature?: ExecutionAuthorizationSignature;
  auditEntries: AuthorizationAuditEntry[];
}) {
  if (!request && !signature && auditEntries.length === 0) return null;

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Authorization request</p>
        {request ? <AuthorizationStatusBadge status={request.status} /> : null}
      </div>
      <ExecutionIntentReview request={request} item={item} />
      {signature ? <AuthorizationSignatureView signature={signature} /> : null}
      {auditEntries.length > 0 ? (
        <ul className="space-y-1 text-xs text-muted">
          {auditEntries.slice(0, 4).map((entry) => (
            <li key={entry.id}>
              <span className="text-foreground">{entry.actor}</span> — {entry.message} · {entry.timestamp}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
