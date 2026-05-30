import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  ListTodo,
  Users,
  Rocket,
  BookOpen,
  Link2,
} from "lucide-react";
import { decisionTrailTitle } from "@/lib/human-first/terminology";

export interface AgentFirstNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

/** Phase 12 navigation — human-friendly labels only. */
export const agentFirstNavItems: AgentFirstNavItem[] = [
  {
    href: "/",
    label: "Projects",
    icon: FolderKanban,
    description: "What you are building and current progress",
  },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/ai-team", label: "AI Team", icon: Users },
  {
    href: "/memory",
    label: "Knowledge",
    icon: BookOpen,
    description: "Lessons and patterns from past work",
  },
  { href: "/releases", label: "Releases", icon: Rocket },
];

/** Advanced — explainability power tools. */
export const agentFirstAdvancedNavItems: AgentFirstNavItem[] = [
  {
    href: "/artifact-lineage",
    label: decisionTrailTitle,
    icon: Link2,
    description: "How an idea became software",
  },
];

export const agentFirstAdvisoryNote =
  "Tell us what you want to build—your AI team records every step so you always know why.";
