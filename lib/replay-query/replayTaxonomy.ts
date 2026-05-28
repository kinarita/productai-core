export const REPLAY_CATEGORIES = [
  {
    value: "replay_summary",
    label: "Replay Summary",
    description: "Executive replay summary context.",
    tone: "calm_operational",
  },
  {
    value: "replay_memory",
    label: "Replay Memory",
    description: "Historical memory replay context.",
    tone: "calm_operational",
  },
  {
    value: "replay_review",
    label: "Replay Review",
    description: "Review lifecycle replay context.",
    tone: "calm_operational",
  },
  {
    value: "replay_runtime",
    label: "Replay Runtime",
    description: "Runtime replay continuity context.",
    tone: "calm_operational",
  },
  {
    value: "replay_governance",
    label: "Replay Governance",
    description: "Governance replay baseline context.",
    tone: "calm_operational",
  },
  {
    value: "replay_advisory",
    label: "Replay Advisory",
    description: "Advisory replay context.",
    tone: "calm_operational",
  },
  {
    value: "replay_timeline",
    label: "Replay Timeline",
    description: "Timeline replay context.",
    tone: "calm_operational",
  },
] as const;

export const CONTINUITY_CATEGORIES = [
  {
    value: "continuity_stable",
    label: "Stable Continuity",
    description: "Continuity is stable under governance review.",
    tone: "calm_operational",
    aliases: ["stable"],
  },
  {
    value: "continuity_review",
    label: "Review Continuity",
    description: "Continuity currently requires review.",
    tone: "calm_operational",
    aliases: ["review"],
  },
  {
    value: "continuity_advisory",
    label: "Advisory Continuity",
    description: "Continuity is advisory-elevated and monitored.",
    tone: "calm_operational",
    aliases: ["degraded"],
  },
  {
    value: "continuity_runtime",
    label: "Runtime Continuity",
    description: "Continuity focused on runtime governance.",
    tone: "calm_operational",
    aliases: ["runtime"],
  },
  {
    value: "continuity_governance",
    label: "Governance Continuity",
    description: "Continuity grounded in governance baseline.",
    tone: "calm_operational",
    aliases: ["governance"],
  },
  {
    value: "continuity_replay",
    label: "Replay Continuity",
    description: "Continuity represented by replay context.",
    tone: "calm_operational",
    aliases: ["replay"],
  },
] as const;

export const REPLAY_SEVERITIES = [
  { value: "low", label: "Low", description: "Low replay severity.", tone: "calm_operational" },
  {
    value: "moderate",
    label: "Moderate",
    description: "Moderate replay severity.",
    tone: "calm_operational",
  },
  {
    value: "elevated",
    label: "Elevated",
    description: "Elevated replay severity.",
    tone: "calm_operational",
  },
  {
    value: "critical_review",
    label: "Critical Review",
    description: "Critical severity requiring explicit review.",
    tone: "calm_operational",
  },
] as const;

export const REPLAY_SOURCES = [
  {
    value: "queue",
    label: "Queue",
    description: "Queue governance source.",
    tone: "calm_operational",
  },
  {
    value: "governance",
    label: "Governance",
    description: "Governance-derived source.",
    tone: "calm_operational",
    aliases: ["system"],
  },
  {
    value: "runtime",
    label: "Runtime",
    description: "Runtime-derived source.",
    tone: "calm_operational",
    aliases: ["runtime_observer"],
  },
  {
    value: "replay",
    label: "Replay",
    description: "Replay-derived source.",
    tone: "calm_operational",
  },
  {
    value: "memory",
    label: "Memory",
    description: "Memory-derived source.",
    tone: "calm_operational",
  },
  {
    value: "orchestration",
    label: "Orchestration",
    description: "Orchestration-derived source.",
    tone: "calm_operational",
    aliases: ["coo"],
  },
  {
    value: "advisory",
    label: "Advisory",
    description: "Advisory-derived source.",
    tone: "calm_operational",
    aliases: ["ceo"],
  },
] as const;

export const ADVISORY_LEVELS = [
  {
    value: "informational",
    label: "Informational",
    description: "Informational advisory level.",
    tone: "calm_operational",
    aliases: ["advisory_low"],
  },
  {
    value: "advisory",
    label: "Advisory",
    description: "Advisory review level.",
    tone: "calm_operational",
    aliases: ["advisory_moderate"],
  },
  {
    value: "elevated",
    label: "Elevated",
    description: "Elevated advisory level.",
    tone: "calm_operational",
    aliases: ["advisory_elevated"],
  },
] as const;

export const GOVERNANCE_CATEGORIES = [
  {
    value: "governance_summary",
    label: "Governance Summary",
    description: "Governance summary context.",
    tone: "calm_operational",
  },
  {
    value: "governance_review",
    label: "Governance Review",
    description: "Governance review context.",
    tone: "calm_operational",
  },
  {
    value: "governance_continuity",
    label: "Governance Continuity",
    description: "Governance continuity context.",
    tone: "calm_operational",
  },
  {
    value: "governance_runtime",
    label: "Governance Runtime",
    description: "Governance runtime context.",
    tone: "calm_operational",
  },
  {
    value: "governance_processing",
    label: "Governance Processing",
    description: "Governance processing context.",
    tone: "calm_operational",
  },
  {
    value: "governance_replay",
    label: "Governance Replay",
    description: "Governance replay context.",
    tone: "calm_operational",
  },
] as const;

export type ReplayCategory = (typeof REPLAY_CATEGORIES)[number]["value"];
export type ContinuityCategory = (typeof CONTINUITY_CATEGORIES)[number]["value"];
export type ReplaySeverity = (typeof REPLAY_SEVERITIES)[number]["value"];
export type ReplaySource = (typeof REPLAY_SOURCES)[number]["value"];
export type AdvisoryLevel = (typeof ADVISORY_LEVELS)[number]["value"];
export type GovernanceCategory = (typeof GOVERNANCE_CATEGORIES)[number]["value"];

export const replayTaxonomyFallbacks = {
  replayCategory: "replay_governance" as ReplayCategory,
  continuityCategory: "continuity_governance" as ContinuityCategory,
  replaySeverity: "moderate" as ReplaySeverity,
  replaySource: "governance" as ReplaySource,
  advisoryLevel: "advisory" as AdvisoryLevel,
  governanceCategory: "governance_summary" as GovernanceCategory,
};
