import type { ProjectActivityItem } from "@/lib/project-creation/projectCreationTypes";

/** Map legacy Phase 21 CEO Review activity copy to Phase 21.5/21.6 labels. */
const LEGACY_MESSAGE_MAP: Record<
  string,
  Pick<ProjectActivityItem, "workerName" | "workerEmoji" | "message">
> = {
  "CEO review started": {
    workerName: "COO Review",
    workerEmoji: "🧭",
    message: "COO review started",
  },
  "CEO review completed": {
    workerName: "COO Review",
    workerEmoji: "🧭",
    message: "COO review completed",
  },
  "CEO approved architecture phase": {
    workerName: "CEO Decision",
    workerEmoji: "👤",
    message: "CEO approved architecture phase",
  },
  "CEO requested additional validation": {
    workerName: "CEO Decision",
    workerEmoji: "👤",
    message: "CEO requested more validation",
  },
  "CEO put project on hold": {
    workerName: "CEO Decision",
    workerEmoji: "👤",
    message: "CEO placed project on hold",
  },
};

export function normalizeActivityItem(item: ProjectActivityItem): ProjectActivityItem {
  const byMessage = LEGACY_MESSAGE_MAP[item.message.trim()];
  if (byMessage) {
    return { ...item, ...byMessage };
  }

  if (item.workerName === "CEO Review") {
    const cooMessage = item.message
      .replace(/^CEO review/i, "COO review")
      .replace(/^CEO Review/i, "COO Review");
    return {
      ...item,
      workerName: "COO Review",
      workerEmoji: "🧭",
      message: cooMessage,
    };
  }

  return item;
}

export function normalizeActivityFeed(items: ProjectActivityItem[]): ProjectActivityItem[] {
  return items.map(normalizeActivityItem);
}
