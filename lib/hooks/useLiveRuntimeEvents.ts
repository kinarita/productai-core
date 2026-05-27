"use client";

import { useEffect, useRef } from "react";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";
import {
  pickRandomRuntimeEvent,
  randomRuntimeEventIntervalMs,
} from "@/lib/store/runtimeEventTemplates";

export function useLiveRuntimeEvents(enabled = true) {
  const applyRuntimeEvent = useRuntimeStore((s) => s.applyRuntimeEvent);
  const addFeedItem = useOrganizationStore((s) => s.addFeedItem);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const scheduleNext = () => {
      const delay = randomRuntimeEventIntervalMs();
      timeoutRef.current = setTimeout(() => {
        const event = pickRandomRuntimeEvent();
        applyRuntimeEvent(event);
        addFeedItem({
          type: "escalation",
          author: "COO",
          authorName: "Nova",
          missionId: "m-2",
          missionName: "Analytics Pipeline",
          message: event.feedMessage,
        });
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, applyRuntimeEvent, addFeedItem]);
}
