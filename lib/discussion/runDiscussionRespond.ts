import {
  buildDiscussionContext,
  inferRelatedSectionFromMessage,
  type DiscussionContextInput,
} from "@/lib/discussion/buildDiscussionContext";
import {
  formatPersonaMemoryBlock,
  type DiscussionPersonaMemory,
} from "@/lib/discussion/personaMemory";
import {
  shouldShowDiscussionDecisionSignal,
} from "@/lib/discussion/decisionCandidateDiscipline";
import {
  buildCooDiscussionSystemPrompt,
  buildCooDiscussionUserPrompt,
  buildDiscussionProposalsSystemPrompt,
  buildDiscussionProposalsUserPrompt,
  buildPlannerDiscussionSystemPrompt,
  buildPlannerDiscussionUserPrompt,
} from "@/lib/discussion/discussionPersona";
import { agentsSuggestEscalation } from "@/lib/discussion/decisionCandidateDiscipline";
import { getDiscussionProvider } from "@/lib/discussion/discussionProvider";
import { parseDiscussionProposalsJson } from "@/lib/discussion/parseDiscussionProposals";
import { runDiscussionHeuristic } from "@/lib/discussion/runDiscussionHeuristic";
import {
  audienceIncludesCoo,
  audienceIncludesPlanner,
  resolveDiscussionAudience,
} from "@/lib/discussion/resolveDiscussionAudience";
import {
  parseStructuredDiscussionResponse,
  type StructuredDiscussionResponse,
} from "@/lib/discussion/structuredDiscussionResponse";
import type {
  BriefChangeProposal,
  DiscussionRelatedSection,
  DiscussionTargetAudience,
} from "@/lib/discussion/discussionTypes";
import type { DiscussionMode } from "@/lib/discussion/strategyRoomTypes";

export type { DiscussionContextInput };

export type DiscussionRespondInput = DiscussionContextInput & {
  userMessage: string;
  discussionMode?: DiscussionMode;
  targetAudience?: DiscussionTargetAudience;
  discussionPersonaMemory?: DiscussionPersonaMemory;
};

export interface DiscussionAgentReply extends StructuredDiscussionResponse {
  text: string;
}

const EMPTY_REPLY: StructuredDiscussionResponse = { summary: "", detail: "" };

export async function runDiscussionRespond(
  input: DiscussionRespondInput
): Promise<{
  discussionSignal?: boolean;
  targetAudience: DiscussionTargetAudience;
  plannerChallenged?: boolean;
  cooRaisedConcern?: boolean;
  plannerSuggestsDecision?: boolean;
  cooSuggestsDecision?: boolean;
  plannerResponse: string;
  plannerSummary: string;
  plannerDetail: string;
  cooResponse: string;
  cooSummary: string;
  cooDetail: string;
  suggestedChanges: BriefChangeProposal[];
  relatedSection: DiscussionRelatedSection;
}> {
  const audience = resolveDiscussionAudience({
    targetAudience: input.targetAudience,
    userMessage: input.userMessage,
  });
  const wantPlanner = audienceIncludesPlanner(audience);
  const wantCoo = audienceIncludesCoo(audience);

  const provider = getDiscussionProvider();
  const ctx = buildDiscussionContext(input);
  const mode = input.discussionMode ?? "explore";
  const personaBlock = formatPersonaMemoryBlock(input.discussionPersonaMemory);

  if (provider.id === "mock") {
    const h = runDiscussionHeuristic({ ...input, discussionMode: mode, targetAudience: audience });
    return { ...h, targetAudience: audience };
  }

  let planner = EMPTY_REPLY;
  let coo = EMPTY_REPLY;

  if (wantPlanner) {
    const plannerRaw = await provider.completeJson(
      buildPlannerDiscussionSystemPrompt(mode, input.userMessage),
      buildPlannerDiscussionUserPrompt(
        ctx.contextBlock,
        ctx.validationHistoryBlock,
        input.userMessage,
        mode,
        personaBlock
      )
    );
    planner = parseStructuredDiscussionResponse(plannerRaw);
  }

  if (wantCoo) {
    const cooRaw = await provider.completeJson(
      buildCooDiscussionSystemPrompt(mode, input.userMessage),
      buildCooDiscussionUserPrompt(
        ctx.contextBlock,
        ctx.validationHistoryBlock,
        input.userMessage,
        planner.summary || "(Product Planner did not respond this turn.)",
        mode,
        personaBlock
      )
    );
    coo = parseStructuredDiscussionResponse(cooRaw);
  }

  let suggestedChanges: BriefChangeProposal[] = [];
  let relatedSection = inferRelatedSectionFromMessage(input.userMessage);

  if (wantPlanner && wantCoo) {
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
      const fallback = runDiscussionHeuristic({
        ...input,
        discussionMode: mode,
        targetAudience: audience,
      });
      suggestedChanges = fallback.suggestedChanges;
      relatedSection = fallback.relatedSection;
    }
  } else {
    const fallback = runDiscussionHeuristic({
      ...input,
      discussionMode: mode,
      targetAudience: audience,
    });
    suggestedChanges = wantPlanner ? fallback.suggestedChanges : [];
    relatedSection = fallback.relatedSection;
  }

  const plannerChallenged =
    wantPlanner &&
    mode === "challenge" &&
    /challenge|assumption|risk|懸念|見直し/i.test(planner.summary);
  const cooRaisedConcern =
    wantCoo && /risk|concern|懸念|競合|収益|complexity|コスト/i.test(coo.summary);

  const escalation = agentsSuggestEscalation(planner.summary, coo.summary);
  const plannerSuggestsDecision =
    planner.suggestsDecisionCandidate === true || escalation.planner;
  const cooSuggestsDecision = coo.suggestsDecisionCandidate === true || escalation.coo;
  const discussionSignal =
    shouldShowDiscussionDecisionSignal(input.userMessage) ||
    planner.discussionSignal === true ||
    coo.discussionSignal === true;

  return {
    targetAudience: audience,
    discussionSignal,
    plannerSuggestsDecision,
    cooSuggestsDecision,
    plannerResponse: planner.summary,
    plannerSummary: planner.summary,
    plannerDetail: planner.detail,
    cooResponse: coo.summary,
    cooSummary: coo.summary,
    cooDetail: coo.detail,
    suggestedChanges,
    relatedSection,
    plannerChallenged,
    cooRaisedConcern,
  };
}
