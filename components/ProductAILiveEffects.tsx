"use client";

import { useLiveRuntimeEvents } from "@/lib/hooks/useLiveRuntimeEvents";

/** Subtle background runtime events — keeps the org stream alive across sessions. */
export function ProductAILiveEffects() {
  useLiveRuntimeEvents(true);
  return null;
}
