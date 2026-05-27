import type { AgentRole } from "@/types/productai";
import { cn } from "@/lib/utils";

const roleColors: Record<AgentRole, string> = {
  COO: "bg-accent text-white",
  Architect: "bg-indigo-100 text-accent",
  Engineer: "bg-slate-100 text-slate-700",
  QA: "bg-emerald-100 text-emerald-800",
};

const roleLabels: Record<AgentRole, string> = {
  COO: "COO",
  Architect: "Architect",
  Engineer: "Engineer",
  QA: "QA",
};

interface AgentAvatarProps {
  role: AgentRole;
  name?: string;
  showStatus?: boolean;
  status?: "active" | "idle" | "analyzing" | "reviewing";
  className?: string;
}

export function AgentAvatar({
  role,
  name,
  showStatus,
  status,
  className,
}: AgentAvatarProps) {
  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : roleLabels[role].slice(0, 2);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
            roleColors[role]
          )}
        >
          {initials}
        </div>
        {showStatus && status && status !== "idle" && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
              status === "analyzing" && "bg-info animate-pulse-subtle",
              status === "reviewing" && "bg-warning",
              status === "active" && "bg-success"
            )}
          />
        )}
      </div>
      {name && (
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted">{roleLabels[role]}</p>
        </div>
      )}
    </div>
  );
}
