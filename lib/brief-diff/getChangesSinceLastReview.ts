import { getBriefAtVersion } from "@/lib/discussion/briefVersioning";
import type { BriefVersionRecord } from "@/lib/discussion/discussionTypes";
import { buildCumulativeChangeSummary } from "@/lib/brief-diff/buildChangeSummary";
import { compareBriefVersions } from "@/lib/brief-diff/computeBriefDiff";
import type { BriefChangeSummary, BriefVersionDiff } from "@/lib/brief-diff/briefDiffTypes";

export function getChangesSinceLastReview(input: {
  briefVersions?: BriefVersionRecord[];
  currentVersion?: number;
  latestApprovedBriefVersion?: number;
}): {
  baselineVersion: number;
  currentVersion: number;
  diff: BriefVersionDiff | null;
  summary: BriefChangeSummary | null;
} {
  const versions = input.briefVersions ?? [];
  const current = input.currentVersion ?? versions[versions.length - 1]?.version ?? 1;
  const approved = input.latestApprovedBriefVersion;
  const baseline = approved && approved < current ? approved : 1;

  if (current <= baseline) {
    return {
      baselineVersion: baseline,
      currentVersion: current,
      diff: null,
      summary: null,
    };
  }

  const fromRecord = getBriefAtVersion(versions, baseline);
  const toRecord = getBriefAtVersion(versions, current);
  if (!fromRecord || !toRecord) {
    return {
      baselineVersion: baseline,
      currentVersion: current,
      diff: null,
      summary: null,
    };
  }

  const diff = compareBriefVersions(
    baseline,
    current,
    fromRecord.brief,
    toRecord.brief,
    fromRecord.psfMvpScope,
    toRecord.psfMvpScope
  );

  if (!diff.hasChanges) {
    return {
      baselineVersion: baseline,
      currentVersion: current,
      diff: null,
      summary: null,
    };
  }

  const summary = buildCumulativeChangeSummary(
    diff,
    approved ?
      "Changes since your last CEO approval."
    : "Changes awaiting your approval since the initial Brief."
  );

  return { baselineVersion: baseline, currentVersion: current, diff, summary };
}
