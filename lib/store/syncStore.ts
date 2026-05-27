"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type HydrationStatus = "idle" | "hydrating" | "success" | "failed";

export interface SyncLogEntry {
  id: string;
  label: string;
  error: string;
  timestamp: string;
}

interface SyncState {
  lastHydratedAt: string | null;
  hydrationStatus: HydrationStatus;
  lastError: string | null;
  writeFailures: SyncLogEntry[];
  readFailures: SyncLogEntry[];
  setHydrationStatus: (status: HydrationStatus, error?: string | null) => void;
  recordReadFailure: (label: string, error: unknown) => void;
  recordWriteFailure: (label: string, error: unknown) => void;
  setLastHydratedAt: (timestamp: string) => void;
  clearSyncLog: () => void;
  resetToInitial: () => void;
}

const syncStoreInitial = {
  lastHydratedAt: null as string | null,
  hydrationStatus: "idle" as HydrationStatus,
  lastError: null as string | null,
  writeFailures: [] as SyncLogEntry[],
  readFailures: [] as SyncLogEntry[],
};

function nowTimestamp() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown sync error";
}

function makeLog(label: string, error: unknown): SyncLogEntry {
  return {
    id: `sync-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    label,
    error: toMessage(error),
    timestamp: nowTimestamp(),
  };
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      ...syncStoreInitial,
      setHydrationStatus: (status, error = null) =>
        set({
          hydrationStatus: status,
          lastError: error,
        }),
      recordReadFailure: (label, error) =>
        set((state) => {
          const next = makeLog(label, error);
          return {
            readFailures: [next, ...state.readFailures].slice(0, 8),
            lastError: next.error,
          };
        }),
      recordWriteFailure: (label, error) =>
        set((state) => ({
          writeFailures: [makeLog(label, error), ...state.writeFailures].slice(0, 8),
        })),
      setLastHydratedAt: (timestamp) => set({ lastHydratedAt: timestamp }),
      clearSyncLog: () =>
        set({
          writeFailures: [],
          readFailures: [],
          lastError: null,
        }),
      resetToInitial: () => set({ ...syncStoreInitial }),
    }),
    {
      name: "productai-sync",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastHydratedAt: state.lastHydratedAt,
        hydrationStatus: state.hydrationStatus,
        lastError: state.lastError,
        writeFailures: state.writeFailures,
        readFailures: state.readFailures,
      }),
    }
  )
);
