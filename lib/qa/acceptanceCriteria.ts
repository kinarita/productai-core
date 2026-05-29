export interface AcceptanceCriterionRow {
  criterion: string;
  relatedFeature: string;
  validationNotes: string;
}

export function buildAcceptanceCriteria(input: {
  missionName: string;
  implementationSummary: string;
}): AcceptanceCriterionRow[] {
  return [
    {
      criterion: "User can create a mission successfully",
      relatedFeature: "Mission creation + persistence",
      validationNotes: "Confirm workflow and persistence; no automatic task generation.",
    },
    {
      criterion: "Product Brief review is accessible",
      relatedFeature: "Artifact Review navigation",
      validationNotes: "Deep link opens artifact context and human comments.",
    },
    {
      criterion: "Lifecycle status is visible",
      relatedFeature: "Product Lifecycle + CEO Home summaries",
      validationNotes: "Ensure stage labels remain consistent and executive-readable.",
    },
    {
      criterion: "Implementation plan is visible and reviewable",
      relatedFeature: "Developer Workspace → Artifact Review",
      validationNotes: "No code generation; review state is descriptive only.",
    },
    {
      criterion: "Quality planning artifacts are visible",
      relatedFeature: "QA Workspace",
      validationNotes: `Validate that QA artifacts match the implementation intent: ${input.implementationSummary.slice(0, 80)}…`,
    },
  ];
}

