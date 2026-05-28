import type { ExecutionTarget, ExecutionTicket } from "@/lib/orchestration/execution/executionTypes";
import { EXECUTION_TARGET_LABELS } from "@/lib/orchestration/execution/executionPolicy";

export interface ExecutionPrepareResult {
  ready: boolean;
  summary: string;
  boundaryNote: string;
}

export interface ExecutionAdapter {
  target: ExecutionTarget;
  prepareExecution(ticket: ExecutionTicket): ExecutionPrepareResult;
  validateExecution(ticket: ExecutionTicket): { valid: boolean; reason: string };
  describeExecutionBoundary(): string;
}

function mockAdapter(target: ExecutionTarget): ExecutionAdapter {
  const describeExecutionBoundary = () =>
    `${EXECUTION_TARGET_LABELS[target]} — prepare and validate only; autonomous execution disabled.`;

  return {
    target,
    prepareExecution(ticket) {
      return {
        ready: false,
        summary: `Handoff prepared for ${ticket.executionIntent} (no execution initiated).`,
        boundaryNote: describeExecutionBoundary(),
      };
    },
    validateExecution(ticket) {
      if (ticket.status !== "handoff_approved") {
        return {
          valid: false,
          reason: "Execution handoff is pending executive approval.",
        };
      }
      return {
        valid: false,
        reason: "Adapter execution is disabled in this phase; handoff boundary only.",
      };
    },
    describeExecutionBoundary,
  };
}

const adapters: ExecutionAdapter[] = [
  mockAdapter("MCP"),
  mockAdapter("GitHub"),
  mockAdapter("ClaudeCode"),
  mockAdapter("InternalAgent"),
  mockAdapter("RuntimeOperation"),
];

export function getExecutionAdapter(target: ExecutionTarget): ExecutionAdapter {
  return adapters.find((a) => a.target === target) ?? mockAdapter(target);
}

export function describeAllExecutionBoundaries(): { target: ExecutionTarget; description: string }[] {
  return adapters.map((a) => ({
    target: a.target,
    description: a.describeExecutionBoundary(),
  }));
}