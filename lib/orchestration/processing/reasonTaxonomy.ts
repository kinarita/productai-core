import type {
  GovernanceSeverity,
  ProcessingGovernanceReason,
  ProcessingReasonCategory,
} from "@/lib/orchestration/processing/processingTypes";

interface ReasonTemplate {
  severity: GovernanceSeverity;
  label: string;
  description: string;
  recommendation: string;
  advisoryOnly: boolean;
}

const REASON_TAXONOMY: Record<ProcessingReasonCategory, ReasonTemplate> = {
  runtime_stability: {
    severity: "medium",
    label: "Runtime stability review",
    description: "Runtime continuity indicates temporary instability in governance processing conditions.",
    recommendation: "Request processing governance review before continuity resumes.",
    advisoryOnly: true,
  },
  governance_review: {
    severity: "medium",
    label: "Governance review required",
    description: "Governance continuity requires explicit review before processing remains active.",
    recommendation: "Route to governance review and record a human decision.",
    advisoryOnly: true,
  },
  dependency_blocker: {
    severity: "high",
    label: "Dependency blocker escalation",
    description: "A blocker dependency affects safe continuity of processing governance state.",
    recommendation: "Pause or deny processing governance until dependency escalation is resolved.",
    advisoryOnly: false,
  },
  authorization_continuity: {
    severity: "high",
    label: "Authorization continuity issue",
    description: "Authorization continuity appears incomplete for current processing governance state.",
    recommendation: "Require governance review and explicit human continuity confirmation.",
    advisoryOnly: false,
  },
  elevated_risk: {
    severity: "high",
    label: "Elevated orchestration risk",
    description: "Runtime and coordination conditions imply elevated governance risk for active continuity.",
    recommendation: "Trigger review_required and keep recommendation-first governance control.",
    advisoryOnly: true,
  },
  sync_instability: {
    severity: "medium",
    label: "Sync continuity instability",
    description: "Sync continuity delays may affect governance confidence in processing state transitions.",
    recommendation: "Pause and review governance continuity until sync conditions stabilize.",
    advisoryOnly: true,
  },
  provider_instability: {
    severity: "medium",
    label: "Provider instability advisory",
    description: "Provider health degradation may reduce confidence in processing continuity.",
    recommendation: "Request review and resume only after advisory reassessment.",
    advisoryOnly: true,
  },
  execution_boundary_review: {
    severity: "medium",
    label: "Execution boundary continuity review",
    description: "Execution boundary continuity should be re-validated before processing remains active.",
    recommendation: "Record governance review outcome and maintain human authorization boundary.",
    advisoryOnly: true,
  },
  manual_governance_pause: {
    severity: "low",
    label: "Manual governance pause",
    description: "A human operator requested a controlled pause for governance continuity.",
    recommendation: "Resume governance continuity with explicit human confirmation.",
    advisoryOnly: false,
  },
  advisory_review: {
    severity: "low",
    label: "Advisory review recommendation",
    description: "Runtime Observer provided an advisory recommendation for governance review.",
    recommendation: "Keep processing in review_required until decision is recorded.",
    advisoryOnly: true,
  },
};

function makeId() {
  return `proc-reason-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function buildProcessingGovernanceReason(
  category: ProcessingReasonCategory,
  overrides?: Partial<Pick<ProcessingGovernanceReason, "title" | "description" | "recommendation">>
): ProcessingGovernanceReason {
  const template = REASON_TAXONOMY[category];
  return {
    id: makeId(),
    category,
    severity: template.severity,
    title: overrides?.title ?? template.label,
    description: overrides?.description ?? template.description,
    recommendation: overrides?.recommendation ?? template.recommendation,
    advisoryOnly: template.advisoryOnly,
    createdAt: nowLabel(),
  };
}
