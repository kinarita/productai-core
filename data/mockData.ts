export type MissionLifecycle =
  | "Idea"
  | "Requirements"
  | "Specification"
  | "Architecture"
  | "UI/UX"
  | "Implementation"
  | "Review"
  | "Release";

export type AgentRole = "COO" | "Architect" | "Engineer" | "QA";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: "active" | "idle" | "analyzing" | "reviewing";
  currentTask?: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  lifecycle: MissionLifecycle;
  progress: number;
  health: "stable" | "delayed" | "risky" | "blocked";
  assignedAgents: AgentRole[];
  blockers: string[];
  recentActivity: string;
  updatedAt: string;
}

export interface OrganizationFeedItem {
  id: string;
  type:
    | "coordination"
    | "task_assignment"
    | "implementation"
    | "architecture"
    | "qa_review"
    | "escalation"
    | "approval_required";
  author: AgentRole;
  authorName: string;
  mission: string;
  message: string;
  timestamp: string;
  requiresCeoApproval?: boolean;
}

export interface Decision {
  id: string;
  title: string;
  mission: string;
  summary: string;
  optionA: { label: string; description: string };
  optionB: { label: string; description: string };
  risks: string[];
  costImpact: string;
  timeImpact: string;
  teamOpinions: { role: AgentRole; opinion: string; stance: "support" | "neutral" | "concern" }[];
  status: "pending" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
}

export interface Task {
  id: string;
  title: string;
  mission: string;
  status: "active" | "in_review" | "blocked" | "completed";
  assignedTo: AgentRole;
  dependencies: string[];
  eta: string;
  progress: number;
}

export interface Release {
  id: string;
  version: string;
  mission: string;
  branch: string;
  state: "candidate" | "staging" | "production" | "rolled_back";
  deployedAt?: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  branch: string;
  status: "open" | "merged" | "draft";
  author: string;
  reviews: number;
}

export interface Commit {
  id: string;
  sha: string;
  message: string;
  author: string;
  branch: string;
  timestamp: string;
}

export interface Branch {
  name: string;
  mission: string;
  ahead: number;
  behind: number;
  lastCommit: string;
}

export interface Memory {
  id: string;
  category: "learning" | "architecture" | "incident" | "pattern";
  title: string;
  summary: string;
  mission?: string;
  createdAt: string;
  tags: string[];
}

export interface RuntimeCost {
  provider: string;
  tokensUsed: number;
  costUsd: number;
  trend: "up" | "down" | "stable";
  health: "healthy" | "degraded" | "down";
}

export interface PendingApproval {
  id: string;
  title: string;
  mission: string;
  type: string;
  requestedAt: string;
}

export interface OperationalAlert {
  id: string;
  severity: "info" | "warning" | "danger";
  message: string;
  mission?: string;
  timestamp: string;
}

export const organizationSettings = {
  organizationName: "Acme Product Labs",
  ceoName: "Alex Chen",
  aiProviders: ["Anthropic Claude", "OpenAI GPT-4o"],
  monthlyBudgetUsd: 2500,
  notifications: {
    approvals: true,
    escalations: true,
    releases: true,
    costAlerts: true,
  },
};

export const organizationHealth = {
  score: 87,
  label: "Healthy",
  cooStatus: "executing" as const,
  activeMissions: 4,
  pendingApprovals: 3,
  weeklyVelocity: 72,
};

export const agents: Agent[] = [
  { id: "coo-1", name: "Nova", role: "COO", status: "active", currentTask: "Mission sync & prioritization" },
  { id: "arch-1", name: "Sage", role: "Architect", status: "analyzing", currentTask: "API boundary review" },
  { id: "eng-1", name: "Flux", role: "Engineer", status: "active", currentTask: "Auth middleware implementation" },
  { id: "qa-1", name: "Lens", role: "QA", status: "reviewing", currentTask: "E2E regression suite" },
];

export const missions: Mission[] = [
  {
    id: "m-1",
    name: "Customer Portal v2",
    description: "Self-service portal for enterprise customers with billing and support.",
    lifecycle: "Implementation",
    progress: 68,
    health: "stable",
    assignedAgents: ["COO", "Architect", "Engineer", "QA"],
    blockers: [],
    recentActivity: "Flux completed OAuth callback handler",
    updatedAt: "2h ago",
  },
  {
    id: "m-2",
    name: "Analytics Pipeline",
    description: "Real-time event ingestion and CEO dashboard metrics.",
    lifecycle: "Architecture",
    progress: 42,
    health: "delayed",
    assignedAgents: ["COO", "Architect"],
    blockers: ["Schema versioning decision pending"],
    recentActivity: "Sage proposed stream partitioning strategy",
    updatedAt: "4h ago",
  },
  {
    id: "m-3",
    name: "Mobile Onboarding",
    description: "Guided onboarding flow for iOS and Android apps.",
    lifecycle: "Review",
    progress: 91,
    health: "stable",
    assignedAgents: ["COO", "Engineer", "QA"],
    blockers: [],
    recentActivity: "Lens flagged animation performance on low-end devices",
    updatedAt: "1h ago",
  },
  {
    id: "m-4",
    name: "Internal Admin Tools",
    description: "Operations console for support and mission management.",
    lifecycle: "Specification",
    progress: 24,
    health: "risky",
    assignedAgents: ["COO", "Architect"],
    blockers: ["Scope creep from stakeholder requests"],
    recentActivity: "Nova scheduled executive sync for scope alignment",
    updatedAt: "6h ago",
  },
];

export const pendingApprovals: PendingApproval[] = [
  { id: "pa-1", title: "Approve stream partitioning for Analytics", mission: "Analytics Pipeline", type: "Architecture", requestedAt: "3h ago" },
  { id: "pa-2", title: "Scope reduction for Admin Tools MVP", mission: "Internal Admin Tools", type: "Scope", requestedAt: "5h ago" },
  { id: "pa-3", title: "Release Mobile Onboarding 1.2.0", mission: "Mobile Onboarding", type: "Release", requestedAt: "1h ago" },
];

export const operationalAlerts: OperationalAlert[] = [
  { id: "al-1", severity: "warning", message: "Analytics Pipeline behind schedule by 4 days", mission: "Analytics Pipeline", timestamp: "4h ago" },
  { id: "al-2", severity: "info", message: "QA review queue at 85% capacity", timestamp: "2h ago" },
  { id: "al-3", severity: "danger", message: "Staging deployment failed — rollback initiated", mission: "Customer Portal v2", timestamp: "30m ago" },
];

export const organizationFeedItems: OrganizationFeedItem[] = [
  {
    id: "f-1",
    type: "coordination",
    author: "COO",
    authorName: "Nova",
    mission: "Customer Portal v2",
    message: "Synchronized sprint priorities. Auth middleware is critical path for this week.",
    timestamp: "10:24 AM",
  },
  {
    id: "f-2",
    type: "task_assignment",
    author: "COO",
    authorName: "Nova",
    mission: "Customer Portal v2",
    message: "Assigned Flux to implement session refresh logic. ETA: 2 days.",
    timestamp: "10:31 AM",
  },
  {
    id: "f-3",
    type: "implementation",
    author: "Engineer",
    authorName: "Flux",
    mission: "Customer Portal v2",
    message: "OAuth callback handler merged. Starting session refresh implementation.",
    timestamp: "11:02 AM",
  },
  {
    id: "f-4",
    type: "architecture",
    author: "Architect",
    authorName: "Sage",
    mission: "Analytics Pipeline",
    message: "Recommend Option B: partition by tenant_id with 7-day retention tiers. Reduces hot-path latency by ~40%.",
    timestamp: "11:15 AM",
    requiresCeoApproval: true,
  },
  {
    id: "f-5",
    type: "qa_review",
    author: "QA",
    authorName: "Lens",
    mission: "Mobile Onboarding",
    message: "E2E suite passed 47/48. One flaky test on step 3 animation — non-blocking for release candidate.",
    timestamp: "11:40 AM",
  },
  {
    id: "f-6",
    type: "escalation",
    author: "Architect",
    authorName: "Sage",
    mission: "Internal Admin Tools",
    message: "Stakeholder scope expansion conflicts with MVP timeline. Recommend executive sync.",
    timestamp: "12:05 PM",
    requiresCeoApproval: true,
  },
  {
    id: "f-7",
    type: "approval_required",
    author: "COO",
    authorName: "Nova",
    mission: "Mobile Onboarding",
    message: "Release 1.2.0 ready for CEO approval. All critical paths verified.",
    timestamp: "12:30 PM",
    requiresCeoApproval: true,
  },
];

export const executiveSyncContext = {
  topic: "Analytics Pipeline — Data Architecture Decision",
  mission: "Analytics Pipeline",
  participants: agents,
  context: [
    "Current ingestion handles 12K events/sec peak",
    "CEO dashboard requires sub-5s freshness",
    "Budget constraint: prefer managed services over custom infra",
  ],
  aiOpinions: [
    { role: "COO" as AgentRole, name: "Nova", opinion: "Delaying this blocks Q2 metrics goals. Recommend decision within 48h." },
    { role: "Architect" as AgentRole, name: "Sage", opinion: "Option B balances cost and latency. Option A is simpler but won't scale past 20K/sec." },
    { role: "Engineer" as AgentRole, name: "Flux", opinion: "Option B adds 3 days implementation but reduces future rework risk." },
    { role: "QA" as AgentRole, name: "Lens", opinion: "Either option testable. Option B needs more integration test coverage." },
  ],
  tradeoffs: [
    { dimension: "Time to ship", optionA: "5 days", optionB: "8 days" },
    { dimension: "Monthly cost", optionA: "$420", optionB: "$680" },
    { dimension: "Scale headroom", optionA: "20K/sec", optionB: "50K/sec" },
    { dimension: "Operational complexity", optionA: "Low", optionB: "Medium" },
  ],
  recommendation: "Proceed with Option B (tenant partitioning). Accept 3-day delay for long-term scalability.",
};

export const decisions: Decision[] = [
  {
    id: "d-1",
    title: "Stream partitioning strategy",
    mission: "Analytics Pipeline",
    summary: "Choose data partitioning approach for real-time analytics ingestion.",
    optionA: { label: "Single stream", description: "One Kafka topic, simpler ops, limited scale" },
    optionB: { label: "Tenant partitioning", description: "Per-tenant topics with retention tiers, higher scale" },
    risks: ["Option A may require re-architecture in Q3", "Option B increases initial complexity"],
    costImpact: "+$260/mo vs Option A",
    timeImpact: "+3 days implementation",
    teamOpinions: [
      { role: "COO", opinion: "Prioritize scalability", stance: "support" },
      { role: "Architect", opinion: "Strongly recommend Option B", stance: "support" },
      { role: "Engineer", opinion: "Manageable complexity increase", stance: "neutral" },
      { role: "QA", opinion: "Need extended test window for B", stance: "concern" },
    ],
    status: "pending",
    priority: "high",
  },
  {
    id: "d-2",
    title: "Admin Tools MVP scope",
    mission: "Internal Admin Tools",
    summary: "Reduce scope to core mission management or extend timeline by 2 weeks.",
    optionA: { label: "Reduced MVP", description: "Mission list + status only, ship in 2 weeks" },
    optionB: { label: "Full scope", description: "All stakeholder features, ship in 4 weeks" },
    risks: ["Reduced MVP may disappoint ops team", "Full scope risks mission slip on other products"],
    costImpact: "Neutral",
    timeImpact: "2 vs 4 weeks",
    teamOpinions: [
      { role: "COO", opinion: "Recommend reduced MVP", stance: "support" },
      { role: "Architect", opinion: "Full scope creates tech debt if rushed", stance: "support" },
      { role: "Engineer", opinion: "Either feasible with right staffing", stance: "neutral" },
      { role: "QA", opinion: "Reduced MVP easier to validate", stance: "support" },
    ],
    status: "pending",
    priority: "medium",
  },
  {
    id: "d-3",
    title: "Mobile Onboarding 1.2.0 release",
    mission: "Mobile Onboarding",
    summary: "Approve production release with one known non-blocking flaky test.",
    optionA: { label: "Release now", description: "Ship to production this week" },
    optionB: { label: "Delay release", description: "Fix flaky test first, ship next week" },
    risks: ["Minor UX glitch possible on old devices", "Delay impacts marketing launch"],
    costImpact: "None",
    timeImpact: "0 vs 5 days",
    teamOpinions: [
      { role: "COO", opinion: "Marketing alignment favors release", stance: "support" },
      { role: "Architect", opinion: "No architectural concerns", stance: "neutral" },
      { role: "Engineer", opinion: "Flaky test is environmental", stance: "support" },
      { role: "QA", opinion: "Acceptable with monitoring", stance: "neutral" },
    ],
    status: "pending",
    priority: "high",
  },
];

export const tasks: Task[] = [
  { id: "t-1", title: "Implement session refresh", mission: "Customer Portal v2", status: "active", assignedTo: "Engineer", dependencies: ["OAuth callback"], eta: "2 days", progress: 35 },
  { id: "t-2", title: "API boundary documentation", mission: "Analytics Pipeline", status: "active", assignedTo: "Architect", dependencies: [], eta: "1 day", progress: 60 },
  { id: "t-3", title: "E2E regression suite", mission: "Mobile Onboarding", status: "in_review", assignedTo: "QA", dependencies: ["UI polish"], eta: "4h", progress: 95 },
  { id: "t-4", title: "Stakeholder requirements sync", mission: "Internal Admin Tools", status: "blocked", assignedTo: "COO", dependencies: ["CEO scope decision"], eta: "—", progress: 10 },
  { id: "t-5", title: "Billing widget integration", mission: "Customer Portal v2", status: "completed", assignedTo: "Engineer", dependencies: [], eta: "Done", progress: 100 },
  { id: "t-6", title: "Performance profiling — onboarding", mission: "Mobile Onboarding", status: "completed", assignedTo: "QA", dependencies: [], eta: "Done", progress: 100 },
];

export const branches: Branch[] = [
  { name: "main", mission: "—", ahead: 0, behind: 0, lastCommit: "chore: bump dependencies" },
  { name: "feat/portal-auth", mission: "Customer Portal v2", ahead: 12, behind: 2, lastCommit: "feat: OAuth callback handler" },
  { name: "feat/analytics-partition", mission: "Analytics Pipeline", ahead: 5, behind: 1, lastCommit: "docs: partitioning RFC" },
  { name: "release/mobile-1.2.0", mission: "Mobile Onboarding", ahead: 3, behind: 0, lastCommit: "fix: onboarding step animation" },
];

export const pullRequests: PullRequest[] = [
  { id: "pr-1", number: 142, title: "feat: OAuth callback handler", branch: "feat/portal-auth", status: "merged", author: "Flux", reviews: 2 },
  { id: "pr-2", number: 143, title: "feat: session refresh middleware", branch: "feat/portal-auth", status: "open", author: "Flux", reviews: 1 },
  { id: "pr-3", number: 89, title: "docs: stream partitioning RFC", branch: "feat/analytics-partition", status: "draft", author: "Sage", reviews: 0 },
  { id: "pr-4", number: 201, title: "release: mobile onboarding 1.2.0", branch: "release/mobile-1.2.0", status: "open", author: "Lens", reviews: 2 },
];

export const commits: Commit[] = [
  { id: "c-1", sha: "a3f2b1c", message: "feat: OAuth callback handler", author: "Flux", branch: "feat/portal-auth", timestamp: "2h ago" },
  { id: "c-2", sha: "d8e4f2a", message: "docs: partitioning RFC", author: "Sage", branch: "feat/analytics-partition", timestamp: "4h ago" },
  { id: "c-3", sha: "b1c9e7d", message: "fix: onboarding step animation", author: "Lens", branch: "release/mobile-1.2.0", timestamp: "1h ago" },
];

export const releases: Release[] = [
  { id: "r-1", version: "2.4.1", mission: "Customer Portal v2", branch: "main", state: "production", deployedAt: "3 days ago" },
  { id: "r-2", version: "1.2.0-rc.1", mission: "Mobile Onboarding", branch: "release/mobile-1.2.0", state: "candidate" },
  { id: "r-3", version: "0.9.0", mission: "Analytics Pipeline", branch: "feat/analytics-partition", state: "staging" },
];

export const memories: Memory[] = [
  {
    id: "mem-1",
    category: "learning",
    title: "Early stakeholder alignment prevents scope creep",
    summary: "Admin Tools mission expanded 40% after week 2. Future missions need signed scope doc before architecture phase.",
    mission: "Internal Admin Tools",
    createdAt: "2025-05-20",
    tags: ["process", "scope"],
  },
  {
    id: "mem-2",
    category: "architecture",
    title: "Prefer tenant-scoped caches for multi-tenant APIs",
    summary: "Shared cache keys caused cross-tenant data leakage in staging. Pattern: always prefix with tenant_id.",
    mission: "Customer Portal v2",
    createdAt: "2025-05-15",
    tags: ["security", "caching"],
  },
  {
    id: "mem-3",
    category: "incident",
    title: "Staging rollback: deployment config drift",
    summary: "Environment variables differed between staging and CI. Added pre-deploy config validation step.",
    mission: "Customer Portal v2",
    createdAt: "2025-05-27",
    tags: ["incident", "deployment"],
  },
  {
    id: "mem-4",
    category: "pattern",
    title: "Feature flags for gradual mobile rollouts",
    summary: "Mobile 1.1.0 used 10% → 50% → 100% rollout. Zero P0 incidents. Standard for all mobile releases.",
    mission: "Mobile Onboarding",
    createdAt: "2025-04-28",
    tags: ["mobile", "release"],
  },
];

export const runtimeCosts: RuntimeCost[] = [
  { provider: "Anthropic Claude", tokensUsed: 2_840_000, costUsd: 892.4, trend: "up", health: "healthy" },
  { provider: "OpenAI GPT-4o", tokensUsed: 1_120_000, costUsd: 336.0, trend: "stable", health: "healthy" },
  { provider: "Embeddings API", tokensUsed: 480_000, costUsd: 48.2, trend: "down", health: "healthy" },
];

export const runtimeSummary = {
  totalTokens: 4_440_000,
  totalCostUsd: 1276.6,
  projectedMonthlyUsd: 2480,
  budgetUsd: 2500,
  apiHealth: "healthy" as const,
};
