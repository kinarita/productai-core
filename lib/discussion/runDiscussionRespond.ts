import {
  buildDiscussionContext,
  inferRelatedSectionFromMessage,
  type DiscussionContextInput,
} from "@/lib/discussion/buildDiscussionContext";
import {
  buildCooDiscussionSystemPrompt,
  buildCooDiscussionUserPrompt,
  buildDiscussionProposalsSystemPrompt,
  buildDiscussionProposalsUserPrompt,
  buildPlannerDiscussionSystemPrompt,
  buildPlannerDiscussionUserPrompt,
} from "@/lib/discussion/discussionPersona";
import { getDiscussionProvider } from "@/lib/discussion/discussionProvider";
import { parseDiscussionProposalsJson } from "@/lib/discussion/parseDiscussionProposals";
import { runDiscussionHeuristic } from "@/lib/discussion/runDiscussionHeuristic";
import {
  parseStructuredDiscussionResponse,
  type StructuredDiscussionResponse,
} from "@/lib/discussion/structuredDiscussionResponse";
import type {
  BriefChangeProposal,
  DiscussionRelatedSection,
} from "@/lib/discussion/discussionTypes";

export type { DiscussionContextInput };

export interface DiscussionAgentReply extends StructuredDiscussionResponse {
  /** Legacy single field — same as summary */
  text: string;
}

export async function runDiscussionRespond(
  input: DiscussionContextInput & { userMessage: string }
): Promise<{
  plannerResponse: string;
  plannerSummary: string;
  plannerDetail: string;
  cooResponse: string;
  cooSummary: string;
  cooDetail: string;
  suggestedChanges: BriefChangeProposal[];
  relatedSection: DiscussionRelatedSection;
}> {
  const provider = getDiscussionProvider();
  const ctx = buildDiscussionContext(input);

  if (provider.id === "mock") {
    const h = runDiscussionHeuristic(input);
    return {
      plannerResponse: h.plannerResponse,
      plannerSummary: h.plannerSummary,
      plannerDetail: h.plannerDetail,
      cooResponse: h.cooResponse,
      cooSummary: h.cooSummary,
      cooDetail: h.cooDetail,
      suggestedChanges: h.suggestedChanges,
      relatedSection: h.relatedSection,
    };
  }

  const plannerRaw = await provider.completeJson(
    buildPlannerDiscussionSystemPrompt(),
    buildPlannerDiscussionUserPrompt(
      ctx.contextBlock,
      ctx.validationHistoryBlock,
      input.userMessage
    )
  );
  const planner = parseStructuredDiscussionResponse(plannerRaw);

  const cooRaw = await provider.completeJson(
    buildCooDiscussionSystemPrompt(),
    buildCooDiscussionUserPrompt(
      ctx.contextBlock,
      ctx.validationHistoryBlock,
      input.userMessage,
      planner.summary
    )
  );
  const coo = parseStructuredDiscussionResponse(cooRaw);

  let suggestedChanges: BriefChangeProposal[] = [];
  let relatedSection = inferRelatedSectionFromMessage(input.userMessage);

  try {
    const proposalsRaw = await provider.completeJson(
      buildDiscussionProposalsSystemPrompt(),
      buildDiscussionProposalsUserPrompt(
        ctx.contextBlock,
        input.userMessage,
        planner.summary,
        coo.summary
      )
    );
    const parsed = parseDiscussionProposalsJson(proposalsRaw);
    suggestedChanges = parsed.suggestedChanges;
    relatedSection = parsed.relatedSection;
  } catch {
    const fallback = runDiscussionHeuristic(input);
    suggestedChanges = fallback.suggestedChanges;
    relatedSection = fallback.relatedSection;
  }

  return {
    plannerResponse: planner.summary,
    plannerSummary: planner.summary,
    plannerDetail: planner.detail,
    cooResponse: coo.summary,
    cooSummary: coo.summary,
    cooDetail: coo.detail,
    suggestedChanges,
    relatedSection,
  };
}
