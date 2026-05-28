"use client";

import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { MaterializationStatusBadge } from "@/components/orchestration/MaterializationStatusBadge";
import type { AIProposal } from "@/lib/orchestration/policy/policyTypes";
import type { ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import type { TaskProvenance } from "@/types/productai";
import { ApprovalSignatureView } from "@/components/orchestration/ApprovalSignatureView";

interface ProvenanceCardProps {
  provenance: TaskProvenance;
  proposal?: AIProposal;
  ticket?: ExecutionTicket;
}

function readinessLabel(readiness?: TaskProvenance["executionReadiness"]) {
  if (!readiness) return "Unknown";
  return readiness.replaceAll("_", " ");
}

export function ProvenanceCard({ provenance, proposal, ticket }: ProvenanceCardProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Governance provenance</p>
      <p className="text-sm text-muted">
        This task exists because an approved execution plan was materialized under executive governance.
      </p>

      <dl className="grid gap-2 text-sm">
        {proposal ? (
          <div>
            <dt className="text-xs text-muted">Originating proposal</dt>
            <dd className="font-medium text-foreground">{proposal.summary}</dd>
          </div>
        ) : provenance.createdFromProposalId ? (
          <div>
            <dt className="text-xs text-muted">Originating proposal</dt>
            <dd className="text-foreground">{provenance.createdFromProposalId}</dd>
          </div>
        ) : null}

        {ticket ? (
          <div>
            <dt className="text-xs text-muted">Execution ticket</dt>
            <dd className="text-foreground">{ticket.executionIntent}</dd>
          </div>
        ) : provenance.createdFromExecutionTicketId ? (
          <div>
            <dt className="text-xs text-muted">Execution ticket</dt>
            <dd className="text-foreground">{provenance.createdFromExecutionTicketId}</dd>
          </div>
        ) : null}

        {provenance.governanceApprovedBy ? (
          <div>
            <dt className="text-xs text-muted">Governance approved by</dt>
            <dd className="text-foreground">{provenance.governanceApprovedBy}</dd>
          </div>
        ) : null}

        <div>
          <dt className="text-xs text-muted">Execution readiness</dt>
          <dd className="mt-1 capitalize text-foreground">{readinessLabel(provenance.executionReadiness)}</dd>
        </div>

        {ticket?.materializationStatus ? (
          <div>
            <dt className="text-xs text-muted">Materialization</dt>
            <dd className="mt-1">
              <MaterializationStatusBadge status={ticket.materializationStatus} />
            </dd>
          </div>
        ) : null}
      </dl>

      {ticket?.approvalSignature ? (
        <ApprovalSignatureView signature={ticket.approvalSignature} />
      ) : null}

      {provenance.governanceNotes?.length ? (
        <ul className="space-y-1 text-xs text-muted">
          {provenance.governanceNotes.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
      ) : null}

      {provenance.executionBoundaryNote ? (
        <GovernanceNote>{provenance.executionBoundaryNote}</GovernanceNote>
      ) : null}
    </div>
  );
}