export type GovernanceStoryModeId =
  | "summary_story"
  | "detailed_story"
  | "continuity_story"
  | "attention_story";

export interface GovernanceStoryMode {
  id: GovernanceStoryModeId;
  title: string;
  description: string;
}

export const governanceStoryModes: GovernanceStoryMode[] = [
  {
    id: "summary_story",
    title: "Summary story",
    description: "Executive-oriented narrative highlighting continuity and review themes.",
  },
  {
    id: "detailed_story",
    title: "Detailed story",
    description: "Expanded interpretation history for deep governance reading.",
  },
  {
    id: "continuity_story",
    title: "Continuity story",
    description: "Continuity-centered flow across interpretation sessions.",
  },
  {
    id: "attention_story",
    title: "Attention story",
    description: "Decision attention lifecycle and unresolved review themes.",
  },
];

export function getGovernanceStoryMode(id: GovernanceStoryModeId): GovernanceStoryMode {
  return governanceStoryModes.find((m) => m.id === id) ?? governanceStoryModes[0];
}
