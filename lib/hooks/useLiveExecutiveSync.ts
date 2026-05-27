"use client";

import { useEffect, useRef } from "react";
import { useOrganizationStore } from "@/lib/store/organizationStore";

export function useLiveExecutiveSync(enabled = true) {
  const rotateDiscussionStatus = useOrganizationStore((s) => s.rotateDiscussionStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      rotateDiscussionStatus();
    }, 12_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, rotateDiscussionStatus]);
}
