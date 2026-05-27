"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type HydrationStatus = "idle" | "hydrating" | "success" | "failed";
export type SyncWarningType = "read" | "write" | "hydration" | "backend";
export type BackendHealthStatus = "healthy" | "degraded" | "unavailable";

const SYNC_PERSIST_VERSION = 2;
const WARNING_DEDUP_WINDOW_MS = 2 * 60 * 1000;

export interface SyncLogEntry {
  id: string;
  label: string;
  error: string;
  timestamp: string;
}

export interface SyncWarning {
  id: string;
  type: SyncWarningType;
  message: string;
  createdAt: string;
  severity: "info" | "warning";
  count?: number;
  lastSeenAt?: string;
}

interface SyncState {
  lastHydratedAt: string | null;
  lastSuccessfulWriteAt: string | null;
  lastSuccessfulReadAt: string | null;
  hydrationStatus: HydrationStatus;
  pendingHydrationCount: number;
  backendHealth: BackendHealthStatus;
  lastError: string | null;
  writeFailures: SyncLogEntry[];
  readFailures: SyncLogEntry[];
  syncWarnings: SyncWarning[];
  setHydrationStatus: (status: HydrationStatus, error?: string | null) => void;
  recordReadFailure: (label: string, error: unknown) => void;
  recordWriteFailure: (label: string, error: unknown) => void;
  setLastSuccessfulWriteAt: (timestamp?: string) => void;
  setLastSuccessfulReadAt: (timestamp?: string) => void;
  setLastHydratedAt: (timestamp: string) => void;
  incrementPendingHydration: () => void;
  resetPendingHydration: () => void;
  addWarning: (warning: Omit<SyncWarning, "id" | "createdAt" | "count" | "lastSeenAt">) => void;
  clearWarnings: () => void;
  clearWarningsByType: (type: SyncWarningType) => void;
  setBackendHealth: (status: BackendHealthStatus) => void;
  clearSyncLog: () => void;
  resetToInitial: () => void;
}

const syncStoreInitial = {
  lastHydratedAt: null as string | null,
  lastSuccessfulWriteAt: null as string | null,
  lastSuccessfulReadAt: null as string | null,
  hydrationStatus: "idle" as HydrationStatus,
  pendingHydrationCount: 0,
  backendHealth: "healthy" as BackendHealthStatus,
  lastError: null as string | null,
  writeFailures: [] as SyncLogEntry[],
  readFailures: [] as SyncLogEntry[],
  syncWarnings: [] as SyncWarning[],
};

function nowTimestamp() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function warningFingerprint(type: SyncWarningType, message: string): string {
  return `${type}::${message}`;
}

function parseWarningTime(value?: string): number | null {
  if (!value) return null;
  const n = Date.parse(value);
  return Number.isNaN(n) ? null : n;
}

function makeWarning(
  warning: Omit<SyncWarning, "id" | "createdAt" | "count" | "lastSeenAt">
): SyncWarning {
  const ts = nowTimestamp();
  return {
    ...warning,
    id: `warn-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    createdAt: ts,
    lastSeenAt: ts,
    count: 1,
  };
}

function upsertWarning(
  existing: SyncWarning[],
  incoming: Omit<SyncWarning, "id" | "createdAt" | "count" | "lastSeenAt">
): SyncWarning[] {
  const fp = warningFingerprint(incoming.type, incoming.message);
  const now = Date.now();
  const idx = existing.findIndex(
    (w) => warningFingerprint(w.type, w.message) === fp
  );

  if (idx >= 0) {
    const prev = existing[idx];
    const lastSeen = parseWarningTime(prev.lastSeenAt ?? prev.createdAt);
    if (lastSeen !== null && now - lastSeen <= WARNING_DEDUP_WINDOW_MS) {
      const updated: SyncWarning = {
        ...prev,
        count: (prev.count ?? 1) + 1,
        lastSeenAt: nowTimestamp(),
        severity: incoming.severity,
      };
      const next = [...existing];
      next[idx] = updated;
      return next;
    }
  }

  return [makeWarning(incoming), ...existing].slice(0, 12);
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

function normalizePersistedWarning(w: SyncWarning): SyncWarning {
  return {
    ...w,
    count: w.count ?? 1,
    lastSeenAt: w.lastSeenAt ?? w.createdAt,
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
      setLastSuccessfulWriteAt: (timestamp) =>
        set({ lastSuccessfulWriteAt: timestamp ?? nowTimestamp() }),
      setLastSuccessfulReadAt: (timestamp) =>
        set({ lastSuccessfulReadAt: timestamp ?? nowTimestamp() }),
      setLastHydratedAt: (timestamp) => set({ lastHydratedAt: timestamp }),
      incrementPendingHydration: () =>
        set((state) => ({
          pendingHydrationCount: Math.min(20, state.pendingHydrationCount + 1),
        })),
      resetPendingHydration: () => set({ pendingHydrationCount: 0 }),
      addWarning: (warning) =>
        set((state) => ({
          syncWarnings: upsertWarning(state.syncWarnings, warning),
        })),
      clearWarnings: () => set({ syncWarnings: [] }),
      clearWarningsByType: (type) =>
        set((state) => ({
          syncWarnings: state.syncWarnings.filter((warning) => warning.type !== type),
        })),
      setBackendHealth: (status) => set({ backendHealth: status }),
      clearSyncLog: () =>
        set({
          writeFailures: [],
          readFailures: [],
          syncWarnings: [],
          lastError: null,
        }),
      resetToInitial: () => set({ ...syncStoreInitial }),
    }),
    {
      name: "productai-sync",
      version: SYNC_PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastHydratedAt: state.lastHydratedAt,
        lastSuccessfulWriteAt: state.lastSuccessfulWriteAt,
        lastSuccessfulReadAt: state.lastSuccessfulReadAt,
        hydrationStatus: state.hydrationStatus,
        pendingHydrationCount: state.pendingHydrationCount,
        backendHealth: state.backendHealth,
        lastError: state.lastError,
        writeFailures: state.writeFailures,
        readFailures: state.readFailures,
        syncWarnings: state.syncWarnings,
      }),
      migrate: (persisted, version) => {
        if (version >= SYNC_PERSIST_VERSION) return persisted as typeof syncStoreInitial;
        const slice = persisted as { syncWarnings?: SyncWarning[] };
        const warnings = slice.syncWarnings ?? [];
        return {
          ...slice,
          syncWarnings: warnings.map(normalizePersistedWarning),
        } as typeof syncStoreInitial;
      },
    }
  )
);
