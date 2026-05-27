import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AgentAvatar } from "@/components/AgentAvatar";
import { missions, type MissionLifecycle } from "@/data/mockData";

const lifecycleSteps: MissionLifecycle[] = [
  "Idea",
  "Requirements",
  "Specification",
  "Architecture",
  "UI/UX",
  "Implementation",
  "Review",
  "Release",
];

const healthVariant = {
  stable: "success" as const,
  delayed: "warning" as const,
  risky: "warning" as const,
  blocked: "danger" as const,
};

export default function MissionsPage() {
  return (
    <AppShell
      title="Products / Missions"
      description="Track software products from idea to release"
    >
      <div className="grid gap-6">
        {missions.map((mission) => {
          const currentIndex = lifecycleSteps.indexOf(mission.lifecycle);
          return (
            <Card key={mission.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{mission.name}</h3>
                    <Badge variant={healthVariant[mission.health]}>{mission.health}</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-muted">{mission.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground">{mission.progress}%</p>
                  <p className="text-xs text-muted">Updated {mission.updatedAt}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  Mission Lifecycle
                </p>
                <div className="flex flex-wrap gap-1">
                  {lifecycleSteps.map((step, i) => (
                    <div key={step} className="flex items-center">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          i <= currentIndex
                            ? "bg-accent text-white"
                            : "bg-surface text-muted"
                        }`}
                      >
                        {step}
                      </span>
                      {i < lifecycleSteps.length - 1 && (
                        <span className="mx-0.5 text-muted">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    Assigned AI Team
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {mission.assignedAgents.map((role) => (
                      <AgentAvatar key={role} role={role} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    Blockers
                  </p>
                  {mission.blockers.length === 0 ? (
                    <p className="text-sm text-muted">None</p>
                  ) : (
                    <ul className="space-y-1">
                      {mission.blockers.map((b) => (
                        <li key={b} className="text-sm text-danger">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    Recent Activity
                  </p>
                  <p className="text-sm text-foreground">{mission.recentActivity}</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
