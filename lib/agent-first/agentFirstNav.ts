import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  ListTodo,
  Users,
  ClipboardCheck,
  Rocket,
  BookOpen,
  Link2,
} from "lucide-react";

export interface AgentFirstNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

/** Phase 1 primary navigation — user-centric, not org-centric. */
export const agentFirstNavItems: AgentFirstNavItem[] = [
  {
    href: "/",
    label: "Projects",
    icon: FolderKanban,
    description: "What you are building and current progress",
  },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/ai-team", label: "AI Team", icon: Users },
  { href: "/review-workspace", label: "Reviews", icon: ClipboardCheck },
  { href: "/releases", label: "Releases", icon: Rocket },
  { href: "/memory", label: "Memory", icon: BookOpen },
];

/** Advanced / power-user routes — internal workspaces remain reachable. */
export const agentFirstAdvancedNavItems: AgentFirstNavItem[] = [
  {
    href: "/artifact-lineage",
    label: "Artifact Lineage",
    icon: Link2,
    description: "Trace why each artifact exists",
  },
];

export const agentFirstAdvisoryNote =
  "Assign work to your AI team—every step records input, reasoning, and output. No black-box automation.";
