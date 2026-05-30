import { buildHeuristicClarificationAssessment } from "@/lib/agents/planner/plannerClarification";
import type { PlannerProvider } from "@/lib/agents/planner/plannerProvider";
import type { PlannerProviderInput } from "@/lib/agents/planner/plannerTypes";

/** Transparent fallback when no API key — still records analysis, decisions, and WHY. */
export class MockPlannerProvider implements PlannerProvider {
  readonly id = "mock";
  readonly model = "productai-planner-local-v1";

  async assessRequirements(input: PlannerProviderInput) {
    const assessment = buildHeuristicClarificationAssessment({
      input: {
        idea: input.idea,
        targetUsers: input.targetUsers,
        successGoal: input.successGoal,
        clarifications: input.clarifications,
        discoveryMode: input.discoveryMode ?? "quick",
      },
      clarificationRound: input.clarificationRound ?? 0,
      clarificationNotes: input.clarifications,
    });

    return {
      analysis: `Mock PM reviewed "${input.projectName}" for completeness (${assessment.completenessScore}/100).`,
      decisions: assessment.needsClarification
        ? ["Ask focused clarification questions before writing the Product Brief"]
        : ["Information is sufficient to draft the Product Brief"],
      reasoning: assessment.needsClarification
        ? assessment.questions.map((q) => `WHY: ${q.reason}`)
        : [
            "WHY: Core user, platform, and success signals are clear enough for v1 scoping.",
            "WHY: Proceeding to Product Brief respects the CEO's time while staying transparent.",
          ],
      assessment,
    };
  }

  async generateProductBrief(input: PlannerProviderInput) {
    const name = input.projectName;
    return {
      analysis: `The team is building "${name}" for ${input.targetUsers}. The success goal anchors what "done" means for the first release.`,
      decisions: [
        "Scope v1 to one primary user journey that proves the core problem",
        "Defer advanced analytics and admin tooling until after first validated release",
        "Express success as measurable outcomes tied to the user's stated goal",
        "Keep the brief readable for non-technical stakeholders",
      ],
      reasoning: [
        `WHY: ${input.targetUsers} need a focused tool—not a platform with every feature on day one.`,
        "WHY: Families and teams struggle when expense/context is scattered; the MVP should make the core action effortless.",
        "WHY: Recording and visibility come before prediction or automation—users must trust basics first.",
        `WHY: Success is defined as: ${input.successGoal}`,
        "WHY: Out-of-scope items are explicit so downstream architects do not over-build.",
      ],
      brief: {
        projectSummary: `${name}: ${input.idea}`,
        problemStatement: `Today, ${input.targetUsers} lack a simple way to address: ${input.idea}. Existing options are either too complex or not tailored to this use case.`,
        targetUsers: input.targetUsers,
        successMetrics: input.successGoal,
        coreFeatures: [
          "Guided onboarding that explains the core value in under 2 minutes",
          "Primary workflow to capture and review the main user action",
          "Clear status view so users know what happened and what is next",
          "Lightweight notifications for important events only",
        ],
        outOfScope: [
          "Advanced analytics dashboards",
          "Third-party integrations beyond essential auth",
          "Multi-tenant enterprise administration",
          "Automated AI recommendations without user consent",
        ],
        risks: [
          "Scope creep if success metrics are not reviewed weekly",
          "Ambiguous ownership between design and engineering during MVP",
          "User trust if core workflow is slower than manual alternatives",
        ],
        recommendedNextStep:
          "CEO reviews this brief, confirms success metrics, then authorizes Director planning when ready.",
      },
    };
  }
}
