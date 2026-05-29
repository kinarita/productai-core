"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  MessageSquare,
  Users,
  Scale,
  ListTodo,
  GitBranch,
  BookOpen,
  Gauge,
  Settings,
  Briefcase,
  Package,
  GitPullRequest,
  Rocket,
  CircleDot,
  Route,
  ArrowRightLeft,
  Link2,
  Lightbulb,
  ClipboardCheck,
  FileText,
  Compass,
  Layers,
  Palette,
  Code2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/ceo-home", label: "CEO Home", icon: Home },
  { href: "/idea-workspace", label: "CEO Idea Workspace", icon: Lightbulb },
  { href: "/product-brief", label: "Product Brief", icon: FileText },
  { href: "/director-workspace", label: "Director Workspace", icon: Compass },
  { href: "/architect-workspace", label: "Architect Workspace", icon: Layers },
  { href: "/designer-workspace", label: "Designer Workspace", icon: Palette },
  { href: "/developer-workspace", label: "Developer Workspace", icon: Code2 },
  { href: "/qa-workspace", label: "QA Workspace", icon: ShieldCheck },
  { href: "/coo-workspace", label: "AI COO Workspace", icon: Briefcase },
  { href: "/delivery-workspace", label: "Delivery Workspace", icon: Package },
  { href: "/repository-workspace", label: "Repository Workspace", icon: GitPullRequest },
  { href: "/release-workspace", label: "Release Readiness", icon: Rocket },
  { href: "/code-release-workspace", label: "Code & Release", icon: CircleDot },
  { href: "/product-lifecycle", label: "Product Lifecycle", icon: Route },
  { href: "/team-handoff", label: "Team Handoff", icon: ArrowRightLeft },
  { href: "/artifact-review", label: "Artifact Review", icon: ClipboardCheck },
  { href: "/artifact-lineage", label: "Artifact Lineage", icon: Link2 },
  { href: "/missions", label: "Products / Missions", icon: Target },
  { href: "/organization-feed", label: "Organization Feed", icon: MessageSquare },
  { href: "/executive-sync", label: "Executive Sync", icon: Users },
  { href: "/judgment", label: "Judgment Center", icon: Scale },
  { href: "/tasks", label: "Tasks & Execution", icon: ListTodo },
  { href: "/code-release", label: "Branches & PRs", icon: GitBranch },
  { href: "/memory", label: "Memory Vault", icon: BookOpen },
  { href: "/runtime-cost", label: "Runtime & Cost", icon: Gauge },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
          PA
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">ProductAI</p>
          <p className="text-xs text-muted">Organization OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <p className="text-xs text-muted">AI org operational</p>
        </div>
      </div>
    </aside>
  );
}
