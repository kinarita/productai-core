"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { buildHumanReviewCards } from "@/lib/human-first/reviewCards";
import { useMissionStore } from "@/lib/store/missionStore";
import { useTaskStore } from "@/lib/store/taskStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { cn } from "@/lib/utils";

export function HumanReviewsView() {
  const missions = useMissionStore((s) => s.missions);
  const tasks = useTaskStore((s) => s.tasks);
  const feedItems = useOrganizationStore((s) => s.organizationFeedItems);

  const cards = buildHumanReviewCards({ missions, tasks, feedItems });
  const waiting = cards.filter((c) => c.statusKind === "waiting");
  const approved = cards.filter((c) => c.statusKind === "approved");
  const changes = cards.filter((c) => c.statusKind === "changes_requested");

  return (
    <AppShell
      title="Reviews"
      description="See what needs your attention—no org-chart required"
    >
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Each card is something the AI team prepared for you. Green means approved, yellow means
        waiting for you, red means changes were requested.
      </p>

      <div className="space-y-8">
        {[
          { heading: "Waiting Review", items: waiting },
          { heading: "Changes Requested", items: changes },
          { heading: "Approved", items: approved },
        ].map(
          (section) =>
            section.items.length > 0 && (
              <section key={section.heading}>
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  {section.heading}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((card) => (
                    <li
                      key={card.reviewId}
                      className="rounded-lg border border-border bg-surface p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground">{card.title}</p>
                        <span className="shrink-0 text-sm" title={card.statusLabel}>
                          {card.statusEmoji}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-xs font-medium",
                          card.statusKind === "approved" && "text-success",
                          card.statusKind === "waiting" && "text-warning",
                          card.statusKind === "changes_requested" && "text-danger"
                        )}
                      >
                        {card.statusLabel}
                      </p>
                      <dl className="mt-3 space-y-1 text-xs text-muted">
                        <div className="flex justify-between gap-2">
                          <dt>Reviewer</dt>
                          <dd className="text-right text-foreground">{card.currentReviewer}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Project</dt>
                          <dd className="text-right text-foreground">{card.missionName}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Updated</dt>
                          <dd className="text-right">{card.lastUpdated}</dd>
                        </div>
                      </dl>
                      <Link
                        href={`/artifact-review?mission=${card.missionId}`}
                        className="mt-3 inline-block text-xs text-accent hover:underline"
                      >
                        View details
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
        )}
        {cards.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet—start a project on the dashboard.</p>
        ) : null}
      </div>

      <p className="mt-8 text-xs text-muted">
        <Link href="/" className="text-accent hover:underline">
          ← Back to Projects
        </Link>
      </p>
    </AppShell>
  );
}
