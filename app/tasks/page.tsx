import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { tasks } from "@/data/mockData";

const columns = [
  { key: "active" as const, label: "Active" },
  { key: "in_review" as const, label: "In Review" },
  { key: "blocked" as const, label: "Blocked" },
  { key: "completed" as const, label: "Completed" },
];

export default function TasksPage() {
  return (
    <AppShell
      title="Tasks & Execution"
      description="Operational implementation tracking across missions"
    >
      <div className="grid gap-6 lg:grid-cols-4">
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key);
          return (
            <Card key={col.key} title={col.label} className="min-h-[320px]">
              <ul className="space-y-3">
                {columnTasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-lg border border-border bg-surface p-4"
                  >
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="mt-1">
                      <MissionLink
                        missionId={task.missionId}
                        missionName={task.missionName}
                        variant="subtle"
                      />
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="accent">{task.assignedTo}</Badge>
                      <span className="text-xs text-muted">ETA {task.eta}</span>
                    </div>
                    {task.dependencies.length > 0 && (
                      <p className="mt-2 text-xs text-muted">
                        Depends: {task.dependencies.join(", ")}
                      </p>
                    )}
                    {task.status !== "completed" && task.status !== "blocked" && (
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    )}
                  </li>
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-sm text-muted">No tasks</p>
                )}
              </ul>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
