import type { ProductBriefStateId } from "@/lib/brief/productBriefStatus";

export type ProductBriefWorkspaceViewId =
  | "board"
  | "review"
  | "approval"
  | "history"
  | "summary"
  | "context";

export interface ProductBriefRecord {
  briefId: string;
  ideaId: string;
  missionId: string | null;
  missionName: string;
  title: string;
  status: ProductBriefStateId;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  plannerNotes: string[];
  reviewNotes: string[];
  approvalNotes: string[];
  approvedAt: string | null;
  approvedBy: string | null;
  handoffReady: boolean;
  planner: string;
  reviewStateLabel: string;
  approvalStateLabel: string;
  directorReadinessLabel: string;
}

export const productBriefWorkspaceAdvisoryNote =
  "CEO approves, AI organizes, Director receives approved planning only—no automatic approval, mission creation, or handoff.";

export function briefIdFromMission(missionId: string): string {
  return `brief-${missionId}`;
}

export function briefArtifactId(missionId: string): string {
  return `${missionId}-product_brief`;
}
