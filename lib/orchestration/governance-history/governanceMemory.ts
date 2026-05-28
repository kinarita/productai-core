import type {
  GovernanceMemoryItem,
  GovernanceTimelineEvent,
} from "@/lib/orchestration/governance-history/governanceHistoryTypes";

export function buildGovernanceMemory(events: GovernanceTimelineEvent[]): GovernanceMemoryItem[] {
  const reviewEvents = events.filter((event) => event.eventType === "review_requested");
  const runtimeEvents = events.filter((event) => event.eventType === "runtime_advisory");
  const criticalEvents = events.filter((event) => event.severity === "critical_review");
  const recurring: GovernanceMemoryItem[] = [];

  if (reviewEvents.length >= 2) {
    recurring.push({
      id: `gov-memory-review-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      memoryType: "repeated_review_pattern",
      title: "Repeated governance review pattern",
      summary: "Recurring governance review patterns were observed across runtime-sensitive missions.",
      evidenceEventIds: reviewEvents.slice(0, 4).map((event) => event.id),
      relatedMissionIds: Array.from(new Set(reviewEvents.map((event) => event.missionId))).slice(0, 4),
      recommendation: "Prioritize mission owners with repeated review_requested transitions.",
    });
  }
  if (runtimeEvents.length >= 2) {
    recurring.push({
      id: `gov-memory-runtime-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      memoryType: "runtime_instability_pattern",
      title: "Runtime instability advisory pattern",
      summary: "Runtime-related advisories repeatedly influenced governance continuity.",
      evidenceEventIds: runtimeEvents.slice(0, 4).map((event) => event.id),
      relatedMissionIds: Array.from(new Set(runtimeEvents.map((event) => event.missionId))).slice(0, 4),
      recommendation: "Track runtime advisory density before prioritizing governance resume decisions.",
    });
  }
  if (criticalEvents.length >= 1) {
    recurring.push({
      id: `gov-memory-bottleneck-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      memoryType: "governance_bottleneck",
      title: "Critical review bottleneck",
      summary: "Critical-review governance events clustered around a limited mission set.",
      evidenceEventIds: criticalEvents.slice(0, 4).map((event) => event.id),
      relatedMissionIds: Array.from(new Set(criticalEvents.map((event) => event.missionId))).slice(0, 4),
      recommendation: "Allocate executive focus to critical review clusters before expanding processing scope.",
    });
  }

  if (!recurring.length) {
    recurring.push({
      id: `gov-memory-stable-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      memoryType: "execution_readiness_pattern",
      title: "Stable governance continuity pattern",
      summary: "Governance transitions remain stable with low repeated review pressure.",
      evidenceEventIds: events.slice(0, 3).map((event) => event.id),
      relatedMissionIds: Array.from(new Set(events.map((event) => event.missionId))).slice(0, 4),
      recommendation: "Maintain cadence and continue human-in-the-loop prioritization.",
    });
  }

  return recurring;
}
