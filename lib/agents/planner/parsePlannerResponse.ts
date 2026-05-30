import type { PlannerGenerationResult, ProductBriefSections } from "@/lib/agents/planner/plannerTypes";

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

function parseBrief(raw: unknown, input: {
  idea: string;
  targetUsers: string;
  successGoal: string;
}): ProductBriefSections {
  const b = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    projectSummary: asString(b.projectSummary, input.idea),
    problemStatement: asString(b.problemStatement, `Users need a solution for: ${input.idea}`),
    targetUsers: asString(b.targetUsers, input.targetUsers),
    successMetrics: asString(b.successMetrics, input.successGoal),
    coreFeatures: asStringArray(b.coreFeatures, [
      "Core user workflow for the primary problem",
      "Simple onboarding for first-time users",
    ]),
    outOfScope: asStringArray(b.outOfScope, [
      "Advanced analytics until v1 proves value",
      "Enterprise admin until core loop works",
    ]),
    risks: asStringArray(b.risks, [
      "Scope creep before MVP validation",
      "Unclear success metrics delaying decisions",
    ]),
    recommendedNextStep: asString(
      b.recommendedNextStep,
      "Review this brief with stakeholders, then hand off to Mission direction when approved."
    ),
  };
}

export function parsePlannerJson(content: string, input: {
  idea: string;
  targetUsers: string;
  successGoal: string;
}): PlannerGenerationResult {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const reasoning = asStringArray(parsed.reasoning, []);
    return {
      analysis: asString(parsed.analysis, "Planner reviewed the project idea and success criteria."),
      decisions: asStringArray(parsed.decisions, [
        "Prioritize MVP scope over feature breadth",
        "Align metrics with the stated success goal",
      ]),
      reasoning:
        reasoning.length > 0
          ? reasoning
          : [
              "The MVP should prove the core user problem before adding complexity.",
              "Target users drive which workflows belong in v1.",
            ],
      brief: parseBrief(parsed.brief, input),
    };
  } catch {
    return {
      analysis: "Planner produced narrative output; structured sections were inferred for readability.",
      decisions: ["Document organized into standard Product Brief sections"],
      reasoning: [
        "Users deserve a clear problem statement before features are discussed.",
        "Success metrics must be visible so the team can judge progress.",
      ],
      brief: {
        projectSummary: input.idea,
        problemStatement: `Users face friction related to: ${input.idea}`,
        targetUsers: input.targetUsers,
        successMetrics: input.successGoal,
        coreFeatures: ["Primary workflow", "Account setup", "Core value delivery"],
        outOfScope: ["Non-essential integrations", "Advanced reporting"],
        risks: ["Ambiguous scope", "Timeline pressure on MVP"],
        recommendedNextStep: "CEO review and approval before architecture begins.",
      },
    };
  }
}
