import type { Mission } from "@/types/productai";
import type { ImplementationPlanRecord } from "@/lib/developer/implementationPlan";
import type { RepositoryPlanView } from "@/lib/developer/repositoryPlan";
import type { TechnicalRiskReviewView } from "@/lib/developer/technicalRiskReview";
import { testPlanIdFromMission } from "@/lib/qa/qaWorkspace";
import { artifactIdForReview } from "@/lib/review/reviewComments";

export interface TestPlanRecord {
  testPlanId: string;
  missionId: string;
  title: string;
  objectives: string[];
  scope: string;
  testAreas: string[];
  assumptions: string[];
  exclusions: string[];
  createdAt: string;
  updatedAt: string;
  artifactReviewHref: string;
}

export function buildTestPlanRecord(input: {
  mission: Mission;
  implementationPlan: ImplementationPlanRecord;
  repositoryPlan: RepositoryPlanView;
  technicalRisks: TechnicalRiskReviewView;
}): TestPlanRecord {
  const artifactId = artifactIdForReview(input.mission.id, "test_plan");
  const focusAreas = [
    "Functional validation across core user journeys",
    "UX validation per design specification expectations",
    "Integration validation for API boundaries and auth/session flows",
    "Data validation for persistence and mission/task state continuity",
    "Security review of auth and role boundaries (planning only)",
    "Documentation review for prohibited behavior messaging (no auto-approval/execution)",
  ];

  return {
    testPlanId: testPlanIdFromMission(input.mission.id),
    missionId: input.mission.id,
    title: `${input.mission.name} — Test Plan`,
    objectives: [
      "Make acceptance expectations explicit for stakeholders.",
      "Document validation coverage and known exclusions.",
      "Surface quality risks early—recommendations only, no automatic gating.",
    ],
    scope: [
      input.implementationPlan.frontendScope,
      input.implementationPlan.backendScope,
      input.implementationPlan.databaseScope,
      input.implementationPlan.aiScope,
      input.implementationPlan.integrationScope,
    ].join(" "),
    testAreas: focusAreas,
    assumptions: [
      "Developer artifacts are planning inputs; QA does not execute tests in ProductAI.",
      input.repositoryPlan.reviewStrategy[0] ?? "Human review scheduled as needed.",
      input.technicalRisks.openTechnicalQuestions[0] ??
        "No open technical questions recorded—confirm with Architect and Developer.",
    ],
    exclusions: [
      "No automated test execution or CI wiring inside ProductAI.",
      "No repository mutation, PR creation, or deployment steps.",
      "No auto QA approval or auto release approval.",
    ],
    createdAt: input.implementationPlan.createdAt,
    updatedAt: input.mission.updatedAt,
    artifactReviewHref: `/artifact-review?mission=${input.mission.id}&artifact=${artifactId}`,
  };
}

