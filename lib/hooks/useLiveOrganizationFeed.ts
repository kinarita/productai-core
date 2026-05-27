"use client";

import { useEffect, useRef } from "react";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import {
  pickRandomFeedTemplate,
  randomLiveIntervalMs,
} from "@/lib/store/liveFeedTemplates";

export function useLiveOrganizationFeed(enabled = true) {
  const addFeedItem = useOrganizationStore((s) => s.addFeedItem);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const scheduleNext = () => {
      const delay = randomLiveIntervalMs();
      timeoutRef.current = setTimeout(() => {
        addFeedItem(pickRandomFeedTemplate());
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, addFeedItem]);
}
