import type { BriefChangeProposal } from "@/lib/discussion/discussionTypes";
import type { BriefChangeSummary, BriefVersionDiff } from "@/lib/brief-diff/briefDiffTypes";

function humanizeFeature(item: string): string {
  const cleaned = item
    .replace(/^\[Should Have\]\s*/i, "")
    .replace(/^\[Must Have\]\s*/i, "")
    .replace(/^\[Refinement\]\s*/i, "")
    .trim();
  if (/chart|グラフ|graph/i.test(cleaned)) return "Monthly Spending Graph";
  if (/category|カテゴリ/i.test(cleaned)) return "Category Breakdown";
  if (/persona|audience|ターゲット/i.test(cleaned)) return "Target Audience Focus";
  if (cleaned.length > 60) return `${cleaned.slice(0, 57)}…`;
  return cleaned;
}

function collectFromDiff(diff: BriefVersionDiff): {
  added: string[];
  modified: string[];
  removed: string[];
} {
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];

  for (const section of diff.sections) {
    if (section.changeType === "unchanged") continue;

    if (section.changeType === "modified") {
      modified.push(section.label);
    }
    if (section.changeType === "removed") {
      removed.push(section.label);
    }

    if (section.addedItems?.length) {
      for (const item of section.addedItems) {
        added.push(humanizeFeature(item));
      }
    } else if (section.changeType === "added" && section.after) {
      added.push(section.label);
    }

    if (section.removedItems?.length) {
      for (const item of section.removedItems) {
        removed.push(humanizeFeature(item));
      }
    }
  }

  return {
    added: [...new Set(added)],
    modified: [...new Set(modified)],
    removed: [...new Set(removed)],
  };
}

export function buildChangeSummary(
  diff: BriefVersionDiff,
  proposal?: Pick<
    BriefChangeProposal,
    "title" | "reason" | "impact" | "confidence"
  >
): BriefChangeSummary {
  const { added, modified, removed } = collectFromDiff(diff);

  if (proposal?.title && added.length === 0 && modified.length === 0) {
    added.push(proposal.title);
  }

  return {
    fromVersion: diff.fromVersion,
    toVersion: diff.toVersion,
    added,
    modified,
    removed,
    reason: proposal?.reason ?? proposal?.title ?? "CEO applied a discussion change.",
    impact: proposal?.impact ?? "Product Brief aligned with strategic discussion.",
    confidence: proposal?.confidence,
    proposalTitle: proposal?.title,
  };
}

/** Aggregate diff from baseline version to current for CEO approval preview. */
export function buildCumulativeChangeSummary(
  diff: BriefVersionDiff,
  reason = "Changes since your last CEO approval or initial Brief."
): BriefChangeSummary {
  const base = buildChangeSummary(diff);
  return { ...base, reason: base.added.length || base.modified.length ? reason : "No Brief changes since last review." };
}
