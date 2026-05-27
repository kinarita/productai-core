"use client";

import { useEffect, useState } from "react";
import { useMissionStore } from "@/lib/store/missionStore";
import { useOrganizationStore } from "@/lib/store/organizationStore";
import { useRuntimeStore } from "@/lib/store/runtimeStore";

function checkAllHydrated() {
  return (
    useMissionStore.persist.hasHydrated() &&
    useOrganizationStore.persist.hasHydrated() &&
    useRuntimeStore.persist.hasHydrated()
  );
}

/** Wait for persisted Zustand stores before rendering store-driven UI. */
export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(checkAllHydrated());

    const unsubs = [
      useMissionStore.persist.onFinishHydration(() => setHydrated(checkAllHydrated())),
      useOrganizationStore.persist.onFinishHydration(() => setHydrated(checkAllHydrated())),
      useRuntimeStore.persist.onFinishHydration(() => setHydrated(checkAllHydrated())),
    ];

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  return hydrated;
}
