"use client";

import { create } from "zustand";
import type { AIProposal, ExecutionPlan, ProposalStatus } from "@/lib/orchestration/policy/policyTypes";
import { requiresCEOApproval } from "@/lib/orchestration/policy/approvalPolicy";
import { initialProposalStatus } from "@/lib/orchestration/policy/orchestrationPolicy";

interface ProposalState {
  proposals: AIProposal[];
  executionPlans: ExecutionPlan[];
  addProposal: (proposal: Omit<AIProposal, "id" | "status" | "createdAt">) => AIProposal;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  setProposalRequiresApproval: (id: string, requiresCEO: boolean) => void;
  addExecutionPlan: (plan: ExecutionPlan) => void;
  getProposal: (id: string) => AIProposal | undefined;
  getProposalsForMission: (missionId: string) => AIProposal[];
  clearProposals: () => void;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export const useProposalStore = create<ProposalState>((set, get) => ({
  proposals: [],
  executionPlans: [],

  addProposal: (input) => {
    const approval = requiresCEOApproval(input);
    const requiresCEO = input.requiresCEOApproval ?? approval.requiresCEOApproval;
    const proposal: AIProposal = {
      ...input,
      id: makeId("prop"),
      status: initialProposalStatus(requiresCEO),
      createdAt: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    set((state) => ({ proposals: [proposal, ...state.proposals].slice(0, 24) }));
    return proposal;
  },

  updateProposalStatus: (id, status) =>
    set((state) => ({
      proposals: state.proposals.map((p) => (p.id === id ? { ...p, status } : p)),
    })),

  setProposalRequiresApproval: (id, requiresCEO) =>
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id
          ? {
              ...p,
              requiresCEOApproval: requiresCEO,
              status: requiresCEO ? "approval_required" : p.status,
            }
          : p
      ),
    })),

  addExecutionPlan: (plan) =>
    set((state) => ({
      executionPlans: [plan, ...state.executionPlans].slice(0, 12),
    })),

  getProposal: (id) => get().proposals.find((p) => p.id === id),

  getProposalsForMission: (missionId) =>
    get().proposals.filter((p) => p.missionId === missionId),

  clearProposals: () => set({ proposals: [], executionPlans: [] }),
}));