"use client";

import { useEffect } from "react";
import { getPersistenceMode } from "@/lib/config/persistenceMode";
import { hydrateProductAIState } from "@/lib/services/readHydrationService";

export function ProductAIReadHydration() {
  useEffect(() => {
    const mode = getPersistenceMode();
    if (mode === "local") return;
    void hydrateProductAIState();
  }, []);

  return null;
}
