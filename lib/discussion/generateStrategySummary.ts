import type { BriefChangeProposal, DiscussionMessage } from "@/lib/discussion/discussionTypes";
import type {
  ExecutiveDecisionRecord,
  StrategySignal,
  StrategySummary,
} from "@/lib/discussion/strategyRoomTypes";

export function generateStrategySummary(input: {
  projectName: string;
  messages: DiscussionMessage[];
  executiveDecisions: ExecutiveDecisionRecord[];
  strategySignals: StrategySignal[];
  appliedProposals: BriefChangeProposal[];
  briefVersion?: number;
}): StrategySummary {
  const ceoTurns = input.messages.filter((m) => m.participant === "ceo").length;
  const agreed = input.executiveDecisions.filter((d) => d.status === "agreed");
  const open = input.executiveDecisions.filter((d) => d.status === "open_question");
  const applied = input.appliedProposals.filter((p) => p.status === "applied");

  const whatWeLearned: string[] = [];
  for (const sig of input.strategySignals.slice(-6)) {
    whatWeLearned.push(`${sig.title}: ${sig.description}`);
  }
  if (!whatWeLearned.length && input.messages.length > 2) {
    whatWeLearned.push(
      `Executive working session on "${input.projectName}" covered ${ceoTurns} CEO turns with Planner and COO perspectives.`
    );
  }

  const whatChanged: string[] = applied.map(
    (p) => `${p.title} (Brief v${input.briefVersion ?? "?"})`
  );
  if (!whatChanged.length) {
    whatChanged.push("No Brief versions applied yet from discussion proposals.");
  }

  const openQuestions: string[] = open.map((d) => d.statement);
  const lastPlanner = [...input.messages].reverse().find((m) => m.participant === "planner");
  if (!openQuestions.length && lastPlanner) {
    const q = lastPlanner.summary?.match(/質問[:：](.+)$/m)?.[1]?.trim();
    if (q) openQuestions.push(q);
  }
  if (!openQuestions.length) {
    openQuestions.push("Validate top MVP assumptions with 5 target users this week.");
  }

  const agreedLine = agreed[0]?.statement;
  const recommendedNextStep = agreedLine
    ? `Proceed with agreed direction: ${agreedLine.slice(0, 160)}`
    : applied.length
      ? `Finalize Brief v${input.briefVersion ?? 1} and run validation on applied changes.`
      : `Convert open discussion items into Brief proposals or executive decisions before CEO approval.`;

  return {
    id: `summary-${Date.now()}`,
    whatWeLearned,
    whatChanged,
    openQuestions,
    recommendedNextStep,
    generatedAt: new Date().toISOString(),
    turnCount: ceoTurns,
    status: "draft",
  };
}
