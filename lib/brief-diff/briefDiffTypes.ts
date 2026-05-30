import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";

export type BriefDiffSectionKey =
  | "projectSummary"
  | "problemStatement"
  | "targetUsers"
  | "successMetrics"
  | "coreFeatures"
  | "mvpScope"
  | "outOfScope"
  | "risks"
  | "recommendedNextStep";

export const BRIEF_DIFF_SECTION_LABELS: Record<BriefDiffSectionKey, string> = {
  projectSummary: "Project Summary",
  problemStatement: "Problem Statement",
  targetUsers: "Target Users",
  successMetrics: "Success Metrics",
  coreFeatures: "Core Features",
  mvpScope: "MVP Scope",
  outOfScope: "Out of Scope",
  risks: "Risks",
  recommendedNextStep: "Recommended Next Step",
};

export interface BriefSectionDiff {
  section: BriefDiffSectionKey;
  label: string;
  changeType: "added" | "modified" | "removed" | "unchanged";
  before?: string;
  after?: string;
  addedItems?: string[];
  removedItems?: string[];
}

export interface BriefVersionDiff {
  fromVersion: number;
  toVersion: number;
  sections: BriefSectionDiff[];
  hasChanges: boolean;
}

export interface BriefChangeSummary {
  fromVersion: number;
  toVersion: number;
  added: string[];
  modified: string[];
  removed: string[];
  reason: string;
  impact: string;
  confidence?: number;
  proposalTitle?: string;
}

export interface BriefVersionAuditRecord {
  versionId: number;
  previousVersionId: number;
  changeSummary: BriefChangeSummary;
  diff: BriefVersionDiff;
  reason: string;
  impact: string;
  confidence?: number;
  sourceDiscussionId?: string;
  appliedBy: "ceo";
  timestamp: string;
}

/** Shown immediately after Apply to Brief (Phase 24-D). */
export interface BriefApplyFeedback {
  missionId: string;
  version: number;
  previousVersion: number;
  summary: BriefChangeSummary;
  proposalTitle: string;
  proposalId?: string;
  diff?: BriefVersionDiff;
  createdAt: string;
}

export interface BriefDiffInput {
  before: ProductBriefSections;
  after: ProductBriefSections;
  mvpScopeBefore?: string[];
  mvpScopeAfter?: string[];
}
