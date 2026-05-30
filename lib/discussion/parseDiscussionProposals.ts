import type {
  BriefChangeProposal,
  DiscussionRelatedSection,
} from "@/lib/discussion/discussionTypes";

function proposalId(): string {
  return `prop-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

const SECTIONS: DiscussionRelatedSection[] = [
  "opportunity",
  "cpf",
  "psf",
  "brief",
  "mvp",
];

function isSection(value: string): value is DiscussionRelatedSection {
  return SECTIONS.includes(value as DiscussionRelatedSection);
}

export function parseDiscussionProposalsJson(
  raw: string,
  messageId?: string
): {
  suggestedChanges: BriefChangeProposal[];
  relatedSection: DiscussionRelatedSection;
} {
  const now = new Date().toISOString();
  let parsed: {
    relatedSection?: string;
    suggestedChanges?: Array<{
      title?: string;
      reason?: string;
      impact?: string;
      description?: string;
      affectedSections?: string[];
      targetSection?: string;
      before?: string;
      after?: string;
      confidence?: number;
    }>;
  };

  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    return { suggestedChanges: [], relatedSection: "brief" };
  }

  const relatedSection: DiscussionRelatedSection = isSection(parsed.relatedSection ?? "")
    ? (parsed.relatedSection as DiscussionRelatedSection)
    : "brief";

  const suggestedChanges: BriefChangeProposal[] = (parsed.suggestedChanges ?? [])
    .filter((p) => p.title?.trim() && p.after?.trim())
    .slice(0, 3)
    .map((p): BriefChangeProposal => {
      const targetSection: DiscussionRelatedSection = isSection(p.targetSection ?? "")
        ? (p.targetSection as DiscussionRelatedSection)
        : relatedSection;
      const affectedSections: DiscussionRelatedSection[] = (
        p.affectedSections ?? [targetSection]
      ).filter((s): s is DiscussionRelatedSection => isSection(s));

      return {
        id: proposalId(),
        title: p.title!.trim(),
        description: p.description?.trim() ?? p.reason?.trim() ?? p.title!.trim(),
        reason: p.reason?.trim() ?? p.description?.trim() ?? "Derived from strategic discussion.",
        impact: p.impact?.trim() ?? "Improves alignment between discussion and Product Brief.",
        affectedSections: affectedSections.length ? affectedSections : [targetSection],
        targetSection,
        before: (p.before ?? "").slice(0, 500),
        after: (p.after ?? "").slice(0, 500),
        confidence: Math.min(100, Math.max(0, Math.round(p.confidence ?? 70))),
        status: "pending" as const,
        proposedAt: now,
        messageId,
      };
    });

  return { suggestedChanges, relatedSection };
}
