import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import type { CustomerProblemFitReport } from "@/lib/cpf/cpfTypes";
import type { ProblemSolutionFitReport } from "@/lib/psf/psfTypes";
import type { OpportunityBrief } from "@/lib/opportunity/opportunityTypes";
import type { BriefChangeSummary, BriefVersionDiff } from "@/lib/brief-diff/briefDiffTypes";
import type { BriefVersionRecord } from "@/lib/discussion/discussionTypes";

export function seedInitialBriefVersion(input: {
  brief: ProductBriefSections;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  psfMvpScope?: string[];
}): { briefVersion: number; briefVersions: BriefVersionRecord[] } {
  const now = new Date().toISOString();
  return {
    briefVersion: 1,
    briefVersions: [
      {
        version: 1,
        label: "v1 Initial Planner Brief",
        brief: input.brief,
        opportunityBrief: input.opportunityBrief,
        cpfReport: input.cpfReport,
        psfReport: input.psfReport,
        psfMvpScope: input.psfMvpScope,
        createdAt: now,
        source: "initial",
      },
    ],
  };
}

export function appendBriefVersion(input: {
  currentVersion: number;
  versions: BriefVersionRecord[];
  brief: ProductBriefSections;
  label: string;
  opportunityBrief?: OpportunityBrief;
  cpfReport?: CustomerProblemFitReport;
  psfReport?: ProblemSolutionFitReport;
  psfMvpScope?: string[];
  proposalId?: string;
  previousVersionId?: number;
  changeSummary?: BriefChangeSummary;
  diff?: BriefVersionDiff;
  reason?: string;
  impact?: string;
  confidence?: number;
  appliedBy?: "ceo";
}): { briefVersion: number; briefVersions: BriefVersionRecord[] } {
  const next = input.currentVersion + 1;
  const record: BriefVersionRecord = {
    version: next,
    label: `v${next} ${input.label}`,
    brief: input.brief,
    opportunityBrief: input.opportunityBrief,
    cpfReport: input.cpfReport,
    psfReport: input.psfReport,
    psfMvpScope: input.psfMvpScope,
    createdAt: new Date().toISOString(),
    source: "discussion_apply",
    proposalId: input.proposalId,
    previousVersionId: input.previousVersionId ?? input.currentVersion,
    changeSummary: input.changeSummary,
    diff: input.diff,
    reason: input.reason,
    impact: input.impact,
    confidence: input.confidence,
    appliedBy: input.appliedBy,
  };
  return {
    briefVersion: next,
    briefVersions: [...input.versions, record],
  };
}

export function getBriefAtVersion(
  versions: BriefVersionRecord[] | undefined,
  version: number | undefined
): BriefVersionRecord | undefined {
  if (!versions?.length || !version) return undefined;
  return versions.find((v) => v.version === version);
}
