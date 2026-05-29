import type { ProductIdea } from "@/lib/idea/ideaWorkspace";

export interface FeaturePriorityRow {
  priority: "P0" | "P1" | "P2";
  feature: string;
  reason: string;
  userImpact: string;
  complexityNote: string;
}

export function buildFeaturePrioritization(idea: ProductIdea): FeaturePriorityRow[] {
  const scope = idea.tags;

  const rows: FeaturePriorityRow[] = [
    {
      priority: "P0",
      feature: "Idea capture and Product Brief draft",
      reason: "Entry point for ProductAI product organization workflow",
      userImpact: "High — CEO and Planner alignment",
      complexityNote: "Visualization and planning support only",
    },
    {
      priority: "P0",
      feature: "Problem and value framing panels",
      reason: "Supports exploration before authorization",
      userImpact: "High — executive-readable planning",
      complexityNote: "Derived from existing mission context",
    },
  ];

  if (scope.includes("enterprise")) {
    rows.push(
      {
        priority: "P0",
        feature: "Enterprise SSO",
        reason: "Blocking requirement for portal v2",
        userImpact: "High — enterprise admins",
        complexityNote: "Auth path on critical path per mission summary",
      },
      {
        priority: "P1",
        feature: "Billing self-service",
        reason: "Revenue operations dependency",
        userImpact: "Medium — finance stakeholders",
        complexityNote: "Coordinate with release readiness workspace",
      }
    );
  }

  if (scope.includes("analytics")) {
    rows.push({
      priority: "P0",
      feature: "Stream partitioning decision",
      reason: "Architecture decision blocks Q2 metrics",
      userImpact: "High — CEO dashboard freshness",
      complexityNote: "Human CEO authorization required",
    });
  }

  if (scope.includes("mobile")) {
    rows.push({
      priority: "P1",
      feature: "Onboarding flow polish",
      reason: "Mobile release validation pending",
      userImpact: "High — new user activation",
      complexityNote: "QA plan review recommended",
    });
  }

  rows.push({
    priority: "P2",
    feature: "Extended governance replay integration",
    reason: "Continuity reading across workspaces",
    userImpact: "Low — operational transparency",
    complexityNote: "Out of MVP unless scope expands",
  });

  return rows;
}
