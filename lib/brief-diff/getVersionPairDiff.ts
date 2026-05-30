import { getBriefAtVersion } from "@/lib/discussion/briefVersioning";
import type { BriefVersionRecord } from "@/lib/discussion/discussionTypes";
import type { BriefChangeSummary, BriefVersionDiff } from "@/lib/brief-diff/briefDiffTypes";
import { compareBriefVersions } from "@/lib/brief-diff/computeBriefDiff";

export function getVersionPairDiff(
  versions: BriefVersionRecord[] | undefined,
  toVersion: number
): { diff: BriefVersionDiff; summary: BriefChangeSummary | undefined } | null {
  if (!versions?.length || toVersion < 2) return null;

  const toRecord = getBriefAtVersion(versions, toVersion);
  if (!toRecord) return null;

  if (toRecord.diff && toRecord.changeSummary) {
    return { diff: toRecord.diff, summary: toRecord.changeSummary };
  }

  const fromVersion = toRecord.previousVersionId ?? toVersion - 1;
  const fromRecord = getBriefAtVersion(versions, fromVersion);
  if (!fromRecord) return null;

  const diff = compareBriefVersions(
    fromVersion,
    toVersion,
    fromRecord.brief,
    toRecord.brief,
    fromRecord.psfMvpScope,
    toRecord.psfMvpScope
  );

  return { diff, summary: toRecord.changeSummary };
}
