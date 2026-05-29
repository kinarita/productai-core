export type DecisionThemeId =
  | "continuity_stability"
  | "runtime_visibility"
  | "governance_review"
  | "mission_focus"
  | "executive_attention"
  | "knowledge_continuity";

export interface DecisionTheme {
  id: DecisionThemeId;
  title: string;
  description: string;
}

export const decisionThemeCatalog: DecisionTheme[] = [
  {
    id: "continuity_stability",
    title: "Continuity Stability",
    description: "How governance continuity readings evolve across interpretation sessions.",
  },
  {
    id: "runtime_visibility",
    title: "Runtime Visibility",
    description: "Replay visibility and confidence context for observability-oriented review.",
  },
  {
    id: "governance_review",
    title: "Governance Review",
    description: "Human governance review concentration and sequencing themes.",
  },
  {
    id: "mission_focus",
    title: "Mission Focus",
    description: "Mission-scoped interpretation and attention continuity.",
  },
  {
    id: "executive_attention",
    title: "Executive Attention",
    description: "Decision attention lifecycle and unresolved review themes.",
  },
  {
    id: "knowledge_continuity",
    title: "Knowledge Continuity",
    description: "Narratives, journals, and journeys that preserve interpretation memory.",
  },
];

const themeMatchers: Array<{ id: DecisionThemeId; patterns: RegExp[] }> = [
  {
    id: "continuity_stability",
    patterns: [/continuity/i, /stability/i, /elevated.?review/i],
  },
  {
    id: "runtime_visibility",
    patterns: [/visibility/i, /runtime/i, /confidence/i, /diagnostic/i],
  },
  {
    id: "governance_review",
    patterns: [/governance/i, /review/i, /interpretation/i, /digest/i],
  },
  {
    id: "mission_focus",
    patterns: [/mission/i, /scope/i],
  },
  {
    id: "executive_attention",
    patterns: [/attention/i, /decision/i, /executive/i, /focus/i],
  },
  {
    id: "knowledge_continuity",
    patterns: [/narrative/i, /journal/i, /journey/i, /memory/i, /atlas/i],
  },
];

export function inferDecisionThemes(text: string): DecisionThemeId[] {
  const matched = themeMatchers
    .filter((matcher) => matcher.patterns.some((pattern) => pattern.test(text)))
    .map((matcher) => matcher.id);
  return [...new Set(matched)];
}

export function getDecisionTheme(id: DecisionThemeId): DecisionTheme {
  return decisionThemeCatalog.find((theme) => theme.id === id) ?? decisionThemeCatalog[0];
}

export function decisionThemeTitles(ids: DecisionThemeId[]): string[] {
  return ids.map((id) => getDecisionTheme(id).title);
}
