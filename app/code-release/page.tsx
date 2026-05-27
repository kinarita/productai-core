import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MissionLink } from "@/components/MissionLink";
import { branches, pullRequests, commits, releases } from "@/data/mockData";
import { GitCommit, GitPullRequest } from "lucide-react";

const releaseStateVariant = {
  candidate: "info" as const,
  staging: "warning" as const,
  production: "success" as const,
  rolled_back: "danger" as const,
};

export default function CodeReleasePage() {
  return (
    <AppShell
      title="Code & Release"
      description="Repository visibility, pull requests, and deployment state"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Branches">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="pb-2 font-medium">Branch</th>
                  <th className="pb-2 font-medium">Mission</th>
                  <th className="pb-2 font-medium">Ahead/Behind</th>
                  <th className="pb-2 font-medium">Last commit</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.name} className="border-b border-border last:border-0">
                    <td className="py-3 font-mono text-sm text-accent">{b.name}</td>
                    <td className="py-3">
                      {b.relatedMissionId ? (
                        <MissionLink
                          missionId={b.relatedMissionId}
                          missionName={b.missionName}
                          variant="subtle"
                        />
                      ) : (
                        <span className="text-muted">{b.missionName}</span>
                      )}
                    </td>
                    <td className="py-3 text-muted">
                      +{b.ahead} / -{b.behind}
                    </td>
                    <td className="py-3 text-foreground">{b.lastCommit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Pull Requests">
          <ul className="space-y-3">
            {pullRequests.map((pr) => (
              <li
                key={pr.id}
                className="flex items-start gap-3 rounded-lg border border-border p-4"
              >
                <GitPullRequest className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted">#{pr.number}</span>
                    <p className="text-sm font-medium text-foreground">{pr.title}</p>
                    <Badge
                      variant={
                        pr.status === "merged"
                          ? "success"
                          : pr.status === "draft"
                            ? "muted"
                            : "info"
                      }
                    >
                      {pr.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {pr.branch} · {pr.author} · {pr.reviews} reviews
                  </p>
                  {pr.relatedMissionId && pr.missionName && (
                    <p className="mt-2">
                      <MissionLink
                        missionId={pr.relatedMissionId}
                        missionName={pr.missionName}
                        variant="pill"
                      />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent Commits">
          <ul className="space-y-3">
            {commits.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <GitCommit className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <div>
                  <p className="text-sm font-medium text-foreground">{c.message}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {c.sha} · {c.branch} · {c.author} · {c.timestamp}
                  </p>
                  {c.relatedMissionId && (
                    <p className="mt-1">
                      <MissionLink missionId={c.relatedMissionId} variant="subtle" />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Release Candidates & Deployment">
          <ul className="space-y-4">
            {releases.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-foreground">v{r.version}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                    <MissionLink
                      missionId={r.relatedMissionId}
                      missionName={r.missionName}
                      variant="pill"
                    />
                    <span>· {r.branch}</span>
                    {r.deployedAt ? <span>· deployed {r.deployedAt}</span> : null}
                  </p>
                </div>
                <Badge variant={releaseStateVariant[r.state]}>{r.state}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
