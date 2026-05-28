"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { AgentAvatar } from "@/components/AgentAvatar";
import { MissionLink } from "@/components/MissionLink";
import { ProposalCard } from "@/components/orchestration/ProposalCard";
import { ExecutionTicketCard } from "@/components/orchestration/ExecutionTicketCard";
import { GovernanceNote } from "@/components/orchestration/GovernanceNote";
import { getHandoffBoundaryMessage } from "@/lib/orchestration/execution/executionPolicy";
import { materializationFeedMessage } from "@/lib/orchestration/materialization/materializationFeed";
import { validateMaterializationBoundary } from "@/lib/orchestration/materialization/materializationPolicy";
import { getTasksByTicketId } from "@/lib/orchestration/materialization/provenanceTracker";
import { useLiveExecutiveSync } from "@/lib/hooks/useLiveExecutiveSync";
import { buildOrchestrationContext } from "@/lib/orchestration/contextBuilder";
import { governanceFeedMessage, feedTypeForProposalStatus } from "@/lib/orchestration/governanceFeed";
import { getProductAIOrchestrator } from "@/lib/orchestration/orchestrator";
import { getExecutionPolicy } from "@/lib/orchestration/policy/executionPolicy";
import type { AIProposal } from "@/lib/orchestration/policy/policyTypes";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useProposalStore } from "@/lib/store/proposalStore";
import { useExecutionStore } from "@/lib/store/executionStore";
import { useMaterializationStore } from "@/lib/store/materializationStore";
import { useSyncStore } from "@/lib/store/syncStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { Gavel } from "lucide-react";

export function ExecutiveSyncView() {
  useLiveExecutiveSync(true);

  const ctx = useOrganizationStore((s) => s.executiveSyncState);
  const setExecutiveSyncState = useOrganizationStore((s) => s.setExecutiveSyncState);
  const addFeedItemWithSync = useOrganizationStore((s) => s.addFeedItemWithSync);
  const proposals = useProposalStore((s) => s.getProposalsForMission(ctx.missionId));
  const executionPlans = useProposalStore((s) => s.executionPlans);
  const addProposal = useProposalStore((s) => s.addProposal);
  const updateProposalStatus = useProposalStore((s) => s.updateProposalStatus);
  const addExecutionPlan = useProposalStore((s) => s.addExecutionPlan);
  const getProposal = useProposalStore((s) => s.getProposal);
  const missionTickets = useExecutionStore((s) => s.getTicketsForMission(ctx.missionId));
  const createTicketFromProposal = useExecutionStore((s) => s.createTicketFromProposal);
  const getTicketForProposal = useExecutionStore((s) => s.getTicketForProposal);
  const approveTicketHandoff = useExecutionStore((s) => s.approveTicketHandoff);
  const rejectTicketHandoff = useExecutionStore((s) => s.rejectTicketHandoff);
  const getAuditForTicket = useExecutionStore((s) => s.getAuditForTicket);
  const requestMaterializationReview = useMaterializationStore((s) => s.requestMaterializationReview);
  const materializeTicket = useMaterializationStore((s) => s.materializeTicket);
  const allTasks = useTaskStore((s) => s.tasks);
  const syncWarnings = useSyncStore((s) => s.syncWarnings);
  const runtimeAlerts = useRuntimeStore((s) => s.alerts);

  const [operationalSummary, setOperationalSummary] = useState<string | null>(null);
  const [planLoadingId, setPlanLoadingId] = useState<string | null>(null);

  const executionPolicy = getExecutionPolicy();

  const pushMaterializationFeed = (
    action: Parameters<typeof materializationFeedMessage>[0],
    detail?: string
  ) => {
    addFeedItemWithSync({
      type: "coordination",
      author: action === "runtime_readiness_advisory" ? "Runtime Observer" : "COO",
      authorName: action === "runtime_readiness_advisory" ? "Pulse" : "Nova",
      missionId: ctx.missionId,
      missionName: ctx.mission,
      message: materializationFeedMessage(action, detail),
      status: "active",
      requiresCeoApproval: false,
    });
  };

  const pushGovernanceFeed = (
    action: Parameters<typeof governanceFeedMessage>[0],
    proposal?: Pick<AIProposal, "summary" | "sourceAgent" | "proposalType">
  ) => {
    addFeedItemWithSync({
      type: proposal ? feedTypeForProposalStatus("approval_required") : "coordination",
      author: proposal?.sourceAgent === "Architect" ? "Architect" : "COO",
      authorName: proposal?.sourceAgent === "Architect" ? "Sage" : "Nova",
      missionId: ctx.missionId,
      missionName: ctx.mission,
      message: governanceFeedMessage(action, proposal),
      status: "active",
      requiresCeoApproval: action === "approval_requested" || action === "proposal_created",
    });
  };

  const generateDiscussion = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const discussion = await orchestrator.generateExecutiveSync(ctx.missionId, context);
    setExecutiveSyncState({
      aiOpinions: discussion.opinions.map((op) => ({
        role: op.role,
        name:
          op.role === "COO"
            ? "Nova"
            : op.role === "Architect"
              ? "Sage"
              : op.role === "QA"
                ? "Lens"
                : op.role === "Runtime Observer"
                  ? "Pulse"
                  : "Alex",
        opinion: op.message,
      })),
      recommendation: discussion.operationalSummary,
      isLive: true,
    });
  };

  const generateOperationalSummary = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const risk = await orchestrator.summarizeExecutionRisk(ctx.missionId, context);
    const summary = `${risk.summary} Risk level: ${risk.riskLevel}.`;
    setOperationalSummary(summary);
    addFeedItemWithSync({
      type: "coordination",
      author: "COO",
      authorName: "Nova",
      missionId: ctx.missionId,
      missionName: ctx.mission,
      message: `COO operational review: ${summary}`,
      status: "active",
      requiresCeoApproval: false,
    });
  };

  const generateProposals = async () => {
    const orchestrator = getProductAIOrchestrator();
    const context = buildOrchestrationContext();
    const drafts = await orchestrator.generateExecutiveProposals(ctx.missionId, context);
    drafts.forEach((draft) => {
      const created = addProposal(draft);
      pushGovernanceFeed("proposal_created", {
        summary: created.summary,
        sourceAgent: created.sourceAgent,
        proposalType: created.proposalType,
      });
      if (created.requiresCEOApproval) {
        pushGovernanceFeed("approval_requested", {
          summary: created.summary,
          sourceAgent: created.sourceAgent,
          proposalType: created.proposalType,
        });
      }
    });
  };

  const handleApprove = (id: string) => {
    const proposal = getProposal(id);
    updateProposalStatus(id, "approved");
    if (proposal) {
      pushGovernanceFeed("approved", {
        summary: proposal.summary,
        sourceAgent: proposal.sourceAgent,
        proposalType: proposal.proposalType,
      });
    }
  };

  const handleRevision = (id: string) => {
    const proposal = getProposal(id);
    updateProposalStatus(id, "revision_requested");
    if (proposal) {
      pushGovernanceFeed("revision_requested", {
        summary: proposal.summary,
        sourceAgent: proposal.sourceAgent,
        proposalType: proposal.proposalType,
      });
    }
  };

  const handleReject = (id: string) => {
    const proposal = getProposal(id);
    updateProposalStatus(id, "rejected");
    if (proposal) {
      pushGovernanceFeed("rejected", {
        summary: proposal.summary,
        sourceAgent: proposal.sourceAgent,
        proposalType: proposal.proposalType,
      });
    }
  };

  const handleGeneratePlan = async (proposalId: string) => {
    const proposal = getProposal(proposalId);
    if (!proposal) return;
    setPlanLoadingId(proposalId);
    try {
      const orchestrator = getProductAIOrchestrator();
      const context = buildOrchestrationContext();
      const plan = await orchestrator.generateExecutionPlan(ctx.missionId, proposal, context);
      addExecutionPlan(plan);
      updateProposalStatus(proposalId, "execution_planned");
      pushGovernanceFeed("execution_planned", {
        summary: proposal.summary,
        sourceAgent: proposal.sourceAgent,
        proposalType: proposal.proposalType,
      });
    } finally {
      setPlanLoadingId(null);
    }
  };

  const handleCreateTicket = (proposalId: string) => {
    const proposal = getProposal(proposalId);
    const plan = executionPlans.find((p) => p.proposalId === proposalId);
    if (!proposal || !plan) return;
    const ticket = createTicketFromProposal(proposal, plan);
    if (ticket) {
      pushGovernanceFeed("handoff_prepared", {
        summary: proposal.summary,
        sourceAgent: proposal.sourceAgent,
        proposalType: proposal.proposalType,
      });
    }
  };

  const handleApproveHandoff = (ticketId: string) => {
    const ticket = useExecutionStore.getState().getTicket(ticketId);
    approveTicketHandoff(ticketId);
    const proposal = ticket ? getProposal(ticket.proposalId) : undefined;
    if (proposal) {
      pushGovernanceFeed("handoff_approved", {
        summary: proposal.summary,
        sourceAgent: proposal.sourceAgent,
        proposalType: proposal.proposalType,
      });
    }
  };

  const handleRequestMaterializationReview = (ticketId: string) => {
    const ticket = useExecutionStore.getState().getTicket(ticketId);
    if (!ticket) return;
    if (requestMaterializationReview(ticketId)) {
      pushMaterializationFeed("materialization_requested", ticket.executionIntent);
      pushMaterializationFeed("governance_review_completed", ticket.executionIntent);
    }
  };

  const handleMaterializeTasks = (ticketId: string) => {
    const ticket = useExecutionStore.getState().getTicket(ticketId);
    if (!ticket) return;
    const record = materializeTicket({
      ticketId,
      missionName: ctx.mission,
      syncWarningCount: syncWarnings.length,
      runtimeAlertCount: runtimeAlerts.length,
    });
    if (record) {
      pushMaterializationFeed(
        "tasks_materialized",
        `${record.taskIds.length} operational tasks prepared`
      );
      if (syncWarnings.length > 0 || runtimeAlerts.length > 0) {
        pushMaterializationFeed("runtime_readiness_advisory", ticket.executionIntent);
      }
    }
  };

  const handleRejectHandoff = (ticketId: string) => {
    const ticket = useExecutionStore.getState().getTicket(ticketId);
    rejectTicketHandoff(ticketId);
    const proposal = ticket ? getProposal(ticket.proposalId) : undefined;
    if (proposal) {
      pushGovernanceFeed("handoff_rejected", {
        summary: proposal.summary,
        sourceAgent: proposal.sourceAgent,
        proposalType: proposal.proposalType,
      });
    }
  };

  return (
    <AppShell
      title="Executive Sync"
      description="Strategic collaboration between CEO and AI leadership"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title={ctx.topic}
            description={
              <span className="inline-flex flex-wrap items-center gap-1">
                Mission:{" "}
                <MissionLink missionId={ctx.missionId} missionName={ctx.mission} variant="link" />
              </span>
            }
          >
            <div className="space-y-6">
              {ctx.isLive && (
                <div className="rounded-lg border border-border bg-surface px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                    </span>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Active discussion
                    </p>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {ctx.discussionStatus.map((s) => (
                      <li key={s.role} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {s.name}{" "}
                          <span className="text-muted">({s.role})</span>
                        </span>
                        <span className="text-xs text-muted">{s.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  Active Participants
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                      AC
                    </div>
                    <div>
                      <p className="text-sm font-medium">Alex Chen</p>
                      <p className="text-xs text-muted">CEO</p>
                    </div>
                  </div>
                  {ctx.participants.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <AgentAvatar role={p.role} name={p.name} showStatus status={p.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  AI Opinions
                </p>
                <ul className="space-y-3">
                  {ctx.aiOpinions.map((op) => (
                    <li
                      key={op.role}
                      className="rounded-lg border border-border bg-surface p-4"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {op.name}{" "}
                        <span className="font-normal text-muted">({op.role})</span>
                      </p>
                      <p className="mt-1 text-sm text-muted">{op.opinion}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-accent/20 bg-indigo-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  Recommendation
                </p>
                <p className="mt-2 text-sm text-foreground">{ctx.recommendation}</p>
              </div>
              {operationalSummary ? (
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Operational Summary
                  </p>
                  <p className="mt-2 text-sm text-foreground">{operationalSummary}</p>
                </div>
              ) : null}

              <GovernanceNote>{executionPolicy.boundaryMessage}</GovernanceNote>
              <GovernanceNote>{getHandoffBoundaryMessage()}</GovernanceNote>
              <GovernanceNote>{validateMaterializationBoundary()}</GovernanceNote>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void generateDiscussion()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Generate AI Discussion
                </button>
                <button
                  type="button"
                  onClick={() => void generateOperationalSummary()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Generate Operational Summary
                </button>
                <button
                  type="button"
                  onClick={() => void generateProposals()}
                  className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-indigo-50/50 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-indigo-50"
                >
                  Generate Structured Proposals
                </button>
              </div>

              {proposals.length > 0 ? (
                <div className="space-y-4 border-t border-border pt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Structured Proposals
                  </p>
                  {proposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      executionPlan={executionPlans.find((p) => p.proposalId === proposal.id)}
                      executionTicket={getTicketForProposal(proposal.id)}
                      onApprove={() => handleApprove(proposal.id)}
                      onRevision={() => handleRevision(proposal.id)}
                      onReject={() => handleReject(proposal.id)}
                      onGeneratePlan={
                        proposal.status === "approved"
                          ? () => void handleGeneratePlan(proposal.id)
                          : undefined
                      }
                      onCreateExecutionTicket={
                        proposal.status === "execution_planned"
                          ? () => handleCreateTicket(proposal.id)
                          : undefined
                      }
                      planLoading={planLoadingId === proposal.id}
                    />
                  ))}
                </div>
              ) : null}

              {missionTickets.length > 0 ? (
                <div className="space-y-4 border-t border-border pt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Execution Handoff
                  </p>
                  {missionTickets.map((ticket) => (
                    <ExecutionTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      auditEntries={getAuditForTicket(ticket.id)}
                      materializedTaskCount={getTasksByTicketId(allTasks, ticket.id).length}
                      onApproveHandoff={() => handleApproveHandoff(ticket.id)}
                      onRejectHandoff={() => handleRejectHandoff(ticket.id)}
                      onRequestMaterializationReview={() =>
                        handleRequestMaterializationReview(ticket.id)
                      }
                      onMaterializeTasks={() => handleMaterializeTasks(ticket.id)}
                      materializeDisabledReason={
                        syncWarnings.length >= 3
                          ? "Materialization blocked by runtime policy advisory."
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Gavel className="h-4 w-4" />
                Make Decision
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Context">
            <ul className="space-y-2">
              {ctx.context.map((line, i) => (
                <li key={i} className="text-sm text-muted">
                  · {line}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Tradeoff Comparison">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="pb-2 pr-4 font-medium">Dimension</th>
                    <th className="pb-2 pr-4 font-medium">Option A</th>
                    <th className="pb-2 font-medium">Option B</th>
                  </tr>
                </thead>
                <tbody>
                  {ctx.tradeoffs.map((row) => (
                    <tr key={row.dimension} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-foreground">{row.dimension}</td>
                      <td className="py-2 pr-4 text-muted">{row.optionA}</td>
                      <td className="py-2 font-medium text-accent">{row.optionB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
