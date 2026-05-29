export type ValidationChecklistStatusId = "planned" | "in_review" | "completed";

export interface ValidationChecklistItem {
  id: string;
  label: string;
  status: ValidationChecklistStatusId;
  notes: string[];
}

export interface ValidationChecklistView {
  functional: ValidationChecklistItem;
  ux: ValidationChecklistItem;
  integration: ValidationChecklistItem;
  data: ValidationChecklistItem;
  security: ValidationChecklistItem;
  documentation: ValidationChecklistItem;
}

export function buildValidationChecklist(input: {
  missionId: string;
  riskCount: number;
  releaseCandidateHint?: boolean;
}): ValidationChecklistView {
  const defaultStatus: ValidationChecklistStatusId =
    input.releaseCandidateHint || input.riskCount > 0 ? "in_review" : "planned";

  const mk = (id: string, label: string, notes: string[]): ValidationChecklistItem => ({
    id,
    label,
    status: defaultStatus,
    notes,
  });

  return {
    functional: mk("functional", "Functional Validation", [
      "Primary user flows behave as documented in acceptance criteria.",
      "No hidden auto-actions; all approvals are human-recorded only.",
    ]),
    ux: mk("ux", "UX Validation", [
      "Executive-readable tone, consistent navigation and labeling.",
      "Accessibility checks (contrast, keyboard navigation where applicable).",
    ]),
    integration: mk("integration", "Integration Validation", [
      "API routes and workspace state boundaries are consistent.",
      "No external integrations (GitHub Actions, MCP execution, deployment).",
    ]),
    data: mk("data", "Data Validation", [
      "Local persistence behavior is stable (Zustand + localStorage).",
      "Mission/Task linkages remain consistent across views.",
    ]),
    security: mk("security", "Security Review", [
      "Auth/session flows reviewed for risk—planning only.",
      "No secret leakage through mock data or UI surfaces.",
    ]),
    documentation: mk("documentation", "Documentation Review", [
      "Docs and UI copy reinforce quality planning only.",
      "Prohibited claims avoided: auto-approve, auto-test, auto-release, deploy.",
    ]),
  };
}

