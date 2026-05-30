import type { BriefVersionRecord } from "@/lib/discussion/discussionTypes";

export function formatVersionTimelineLabel(
  record: BriefVersionRecord,
  proposalTitle?: string
): string {
  if (record.source === "initial") {
    return "v1 Initial Brief";
  }

  const short =
    proposalTitle ??
    record.changeSummary?.proposalTitle ??
    record.label.replace(/^v\d+\s*/i, "").trim();

  const origin =
    record.source === "discussion_apply" ? "(from discussion)" : "(from validation)";

  return `v${record.version} ${short} ${origin}`;
}
