"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import {
  activityFeedTitle,
  ProjectActivityFeed,
} from "@/components/projects/ProjectActivityFeed";
import type { ProjectActivityItem } from "@/lib/project-creation/projectCreationTypes";
import { normalizeActivityFeed } from "@/lib/coo-review/normalizeActivityLabels";

const INITIAL_VISIBLE = 7;

export function ProjectActivitySection({ items }: { items: ProjectActivityItem[] }) {
  const total = normalizeActivityFeed(items).length;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const effectiveVisible = Math.min(visibleCount, total);

  return (
    <Card title={activityFeedTitle(effectiveVisible, total)}>
      <ProjectActivityFeed
        items={items}
        visibleCount={visibleCount}
        onVisibleCountChange={setVisibleCount}
      />
    </Card>
  );
}
