import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AgentAvatar } from "@/components/AgentAvatar";
import { organizationFeedItems } from "@/data/mockData";
import { ShieldAlert } from "lucide-react";

const typeLabels: Record<string, string> = {
  coordination: "Coordination",
  task_assignment: "Task Assignment",
  implementation: "Implementation Update",
  architecture: "Architecture Recommendation",
  qa_review: "QA Review",
  escalation: "Escalation",
  approval_required: "Approval Required",
};

const typeVariant: Record<string, "default" | "info" | "warning" | "accent" | "danger"> = {
  coordination: "default",
  task_assignment: "info",
  implementation: "info",
  architecture: "accent",
  qa_review: "default",
  escalation: "warning",
  approval_required: "danger",
};

export default function OrganizationFeedPage() {
  return (
    <AppShell
      title="Organization Feed"
      description="Live stream of AI organizational collaboration"
    >
      <Card>
        <ul className="space-y-6">
          {organizationFeedItems.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0"
            >
              <AgentAvatar
                role={item.author}
                name={item.authorName}
                showStatus
                status="active"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={typeVariant[item.type] ?? "default"}>
                    {typeLabels[item.type]}
                  </Badge>
                  <span className="text-xs text-muted">{item.mission}</span>
                  <span className="text-xs text-muted">· {item.timestamp}</span>
                  {item.requiresCeoApproval && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-warning">
                      <ShieldAlert className="h-3 w-3" />
                      CEO approval required
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{item.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}
