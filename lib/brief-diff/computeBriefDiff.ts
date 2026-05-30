import type { ProductBriefSections } from "@/lib/agents/planner/plannerTypes";
import {
  BRIEF_DIFF_SECTION_LABELS,
  type BriefDiffInput,
  type BriefDiffSectionKey,
  type BriefSectionDiff,
  type BriefVersionDiff,
} from "@/lib/brief-diff/briefDiffTypes";

function normalizeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function listDiff(before: string[], after: string[]): {
  added: string[];
  removed: string[];
  modified: boolean;
} {
  const beforeSet = new Set(before.map(normalizeLine));
  const afterSet = new Set(after.map(normalizeLine));
  const added = after.filter((item) => !beforeSet.has(normalizeLine(item)));
  const removed = before.filter((item) => !afterSet.has(normalizeLine(item)));
  const modified =
    added.length > 0 ||
    removed.length > 0 ||
    before.join("\n") !== after.join("\n");
  return { added, removed, modified };
}

function textSection(
  section: BriefDiffSectionKey,
  before: string,
  after: string
): BriefSectionDiff {
  const b = normalizeLine(before);
  const a = normalizeLine(after);
  if (b === a) {
    return {
      section,
      label: BRIEF_DIFF_SECTION_LABELS[section],
      changeType: "unchanged",
      before: b,
      after: a,
    };
  }
  if (!b && a) {
    return {
      section,
      label: BRIEF_DIFF_SECTION_LABELS[section],
      changeType: "added",
      after: a,
    };
  }
  if (b && !a) {
    return {
      section,
      label: BRIEF_DIFF_SECTION_LABELS[section],
      changeType: "removed",
      before: b,
    };
  }
  return {
    section,
    label: BRIEF_DIFF_SECTION_LABELS[section],
    changeType: "modified",
    before: b,
    after: a,
  };
}

function arraySection(
  section: BriefDiffSectionKey,
  before: string[],
  after: string[]
): BriefSectionDiff {
  const { added, removed, modified } = listDiff(before, after);
  if (!modified) {
    return {
      section,
      label: BRIEF_DIFF_SECTION_LABELS[section],
      changeType: "unchanged",
    };
  }
  if (!before.length && after.length) {
    return {
      section,
      label: BRIEF_DIFF_SECTION_LABELS[section],
      changeType: "added",
      addedItems: after,
      after: after.join("\n"),
    };
  }
  if (before.length && !after.length) {
    return {
      section,
      label: BRIEF_DIFF_SECTION_LABELS[section],
      changeType: "removed",
      removedItems: before,
      before: before.join("\n"),
    };
  }
  return {
    section,
    label: BRIEF_DIFF_SECTION_LABELS[section],
    changeType: "modified",
    before: before.join("\n"),
    after: after.join("\n"),
    addedItems: added,
    removedItems: removed,
  };
}

export function computeBriefDiff(
  fromVersion: number,
  toVersion: number,
  input: BriefDiffInput
): BriefVersionDiff {
  const { before, after } = input;
  const mvpBefore = input.mvpScopeBefore ?? [];
  const mvpAfter = input.mvpScopeAfter ?? [];

  const sections: BriefSectionDiff[] = [
    textSection("projectSummary", before.projectSummary, after.projectSummary),
    textSection("problemStatement", before.problemStatement, after.problemStatement),
    textSection("targetUsers", before.targetUsers, after.targetUsers),
    textSection("successMetrics", before.successMetrics, after.successMetrics),
    arraySection("coreFeatures", before.coreFeatures, after.coreFeatures),
    arraySection("mvpScope", mvpBefore, mvpAfter),
    arraySection("outOfScope", before.outOfScope, after.outOfScope),
    arraySection("risks", before.risks, after.risks),
    textSection(
      "recommendedNextStep",
      before.recommendedNextStep,
      after.recommendedNextStep
    ),
  ];

  const hasChanges = sections.some((s) => s.changeType !== "unchanged");

  return { fromVersion, toVersion, sections, hasChanges };
}

export function compareBriefVersions(
  fromVersion: number,
  toVersion: number,
  beforeBrief: ProductBriefSections,
  afterBrief: ProductBriefSections,
  mvpScopeBefore?: string[],
  mvpScopeAfter?: string[]
): BriefVersionDiff {
  return computeBriefDiff(fromVersion, toVersion, {
    before: beforeBrief,
    after: afterBrief,
    mvpScopeBefore,
    mvpScopeAfter,
  });
}
