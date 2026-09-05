"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "portfolio:gyro-tilt";

type Permission = "granted" | "denied" | "prompt";

type RequestPermissionFn = () => Promise<"granted" | "denied">;
type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: RequestPermissionFn;
};

type Snapshot = {
  /** Touch device that actually reports device orientation (phones/tablets;
   *  desktops with a pointer are already covered by mouse-driven pan). */
  supported: boolean;
  /** iOS-style gate: tilt needs an explicit granted permission before it can start. */
  needsPermission: boolean;
  permission: Permission;
  /** Visitor's own on/off choice — defaults on once nothing needs asking. */
  enabled: boolean;
};

const SERVER_SNAPSHOT: Snapshot = {
  supported: false,
  needsPermission: false,
  permission: "prompt",
  enabled: true,
};

let cached: Snapshot | null = null;
const listeners = new Set<() => void>();

function computeSnapshot(): Snapshot {
  if (cached) return cached;
  const supported =
    typeof window !== "undefined" &&
    "DeviceOrientationEvent" in window &&
    window.matchMedia("(hover: none)").matches;
  const OrientationEvent = supported
    ? (window.DeviceOrientationEvent as OrientationEventWithPermission)
    : undefined;
  const needsPermission = typeof OrientationEvent?.requestPermission === "function";
  cached = {
    supported,
    needsPermission,
    permission: needsPermission ? "prompt" : "granted",
    enabled: readEnabled(),
  };
  return cached;
}

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}
function writeEnabled(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? "on" : "off");
  } catch {
    /* private mode — non-fatal */
  }
}

function patch(next: Partial<Snapshot>) {
  cached = { ...computeSnapshot(), ...next };
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Gates the gyroscope-driven tilt in `useParallaxPan` on touch devices.
 * iOS requires an explicit, gesture-triggered permission prompt before
 * `deviceorientation` fires at all; Android (and everything else) just
 * fires it, so there's nothing to ask — only something to disable.
 */
export function useGyroTilt() {
  const state = useSyncExternalStore(subscribe, computeSnapshot, () => SERVER_SNAPSHOT);

  const requestPermission = useCallback(async () => {
    const OrientationEvent = window.DeviceOrientationEvent as OrientationEventWithPermission;
    if (typeof OrientationEvent.requestPermission !== "function") return;
    try {
      const result = await OrientationEvent.requestPermission();
      if (result === "granted") writeEnabled(true);
      patch({ permission: result, enabled: result === "granted" });
    } catch {
      patch({ permission: "denied" });
    }
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    writeEnabled(next);
    patch({ enabled: next });
  }, []);

  const active =
    state.supported && state.enabled && (!state.needsPermission || state.permission === "granted");

  return {
    ...state,
    active,
    requestPermission,
    setEnabled,
    toggle: () => setEnabled(!state.enabled),
  };
}
