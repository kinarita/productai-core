"use client";

import { create } from "zustand";
import type { AIProposal, ExecutionPlan } from "@/lib/orchestration/policy/policyTypes";
import type { ExecutionAuditEntry, ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import { createAuditEntry } from "@/lib/orchestration/execution/executionAudit";
import {
  approveHandoff,
  buildExecutionTicketDraft,
  finalizeTicketIds,
  rejectHandoff,
  submitTicketForHandoff,
} from "@/lib/orchestration/execution/executionHandoff";

interface ExecutionGovernanceStats {
  pendingHandoffs: number;
  approvedHandoffs: number;
  queueSize: number;
}

interface ExecutionState {
  tickets: ExecutionTicket[];
  auditLog: ExecutionAuditEntry[];
  createTicketFromProposal: (proposal: AIProposal, plan?: ExecutionPlan) => ExecutionTicket | null;
  submitForHandoff: (ticketId: string) => void;
  approveTicketHandoff: (ticketId: string, governanceNote?: string) => void;
  rejectTicketHandoff: (ticketId: string) => void;
  getTicket: (id: string) => ExecutionTicket | undefined;
  getTicketForProposal: (proposalId: string) => ExecutionTicket | undefined;
  getTicketsForMission: (missionId: string) => ExecutionTicket[];
  getAuditForTicket: (ticketId: string) => ExecutionAuditEntry[];
  getGovernanceStats: () => ExecutionGovernanceStats;
  clearExecutionState: () => void;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  tickets: [],
  auditLog: [],

  createTicketFromProposal: (proposal, plan) => {
    const existing = get().tickets.find((t) => t.proposalId === proposal.id && t.status !== "cancelled");
    if (existing) return existing;

    const draft = buildExecutionTicketDraft({ proposal, executionPlan: plan });
    let ticket = finalizeTicketIds(draft);
    ticket = submitTicketForHandoff(ticket);

    const createdAudit = createAuditEntry({
      ticketId: ticket.id,
      action: "ticket_created",
      actor: "Nova",
      role: "COO",
      intent: proposal.summary,
    });
    const submittedAudit = createAuditEntry({
      ticketId: ticket.id,
      action: "handoff_submitted",
      actor: "Nova",
      role: "COO",
      intent: proposal.summary,
    });

    set((state) => ({
      tickets: [ticket, ...state.tickets].slice(0, 24),
      auditLog: [submittedAudit, createdAudit, ...state.auditLog].slice(0, 48),
    }));

    return ticket;
  },

  submitForHandoff: (ticketId) =>
    set((state) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return state;
      const updated = submitTicketForHandoff(ticket);
      const audit = createAuditEntry({
        ticketId,
        action: "handoff_submitted",
        actor: "Nova",
        role: "COO",
      });
      return {
        tickets: state.tickets.map((t) => (t.id === ticketId ? updated : t)),
        auditLog: [audit, ...state.auditLog].slice(0, 48),
      };
    }),

  approveTicketHandoff: (ticketId, governanceNote) =>
    set((state) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return state;
      const updated = approveHandoff(ticket, governanceNote);
      const audit = createAuditEntry({
        ticketId,
        action: "approval_granted",
        actor: "Alex Chen",
        role: "CEO",
        intent: ticket.executionIntent,
      });
      return {
        tickets: state.tickets.map((t) => (t.id === ticketId ? updated : t)),
        auditLog: [audit, ...state.auditLog].slice(0, 48),
      };
    }),

  rejectTicketHandoff: (ticketId) =>
    set((state) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return state;
      const updated = rejectHandoff(ticket);
      const audit = createAuditEntry({
        ticketId,
        action: "approval_rejected",
        actor: "Alex Chen",
        role: "CEO",
        intent: ticket.executionIntent,
      });
      return {
        tickets: state.tickets.map((t) => (t.id === ticketId ? updated : t)),
        auditLog: [audit, ...state.auditLog].slice(0, 48),
      };
    }),

  getTicket: (id) => get().tickets.find((t) => t.id === id),

  getTicketForProposal: (proposalId) =>
    get().tickets.find((t) => t.proposalId === proposalId && t.status !== "cancelled"),

  getTicketsForMission: (missionId) =>
    get().tickets.filter((t) => t.missionId === missionId),

  getAuditForTicket: (ticketId) => get().auditLog.filter((a) => a.ticketId === ticketId),

  getGovernanceStats: () => {
    const tickets = get().tickets;
    const pendingHandoffs = tickets.filter(
      (t) => t.status === "draft" || t.status === "awaiting_handoff"
    ).length;
    const approvedHandoffs = tickets.filter((t) => t.status === "handoff_approved").length;
    return {
      pendingHandoffs,
      approvedHandoffs,
      queueSize: pendingHandoffs + approvedHandoffs,
    };
  },

  clearExecutionState: () => set({ tickets: [], auditLog: [] }),
}));