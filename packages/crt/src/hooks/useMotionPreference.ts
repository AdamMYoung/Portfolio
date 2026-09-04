"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MOTION_STORAGE_KEY as KEY } from "../head";

type Stored = "on" | "off";

/**
 * Effective "reduce motion" state, shared across every consumer via a module
 * store so the toggle, the parallax rig and the boot animation stay in sync
 * (and across tabs, via the `storage` event). Precedence: explicit in-app
 * choice (localStorage) → OS `prefers-reduced-motion`.
 */
export function useMotionPreference() {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const setReduced = useCallback((next: boolean) => {
    write(next ? "off" : "on");
    setAttr(next);
    emit();
  }, []);

  const clearChoice = useCallback(() => {
    write(null);
    setAttr(prefersReducedOS());
    emit();
  }, []);

  return {
    reduced,
    hasExplicitChoice: read() !== null,
    setReduced,
    toggle: () => setReduced(!reduced),
    clearChoice,
  };
}

/* ---- module store ------------------------------------------------- */
const listeners = new Set<() => void>();
const emit = () => {
  for (const l of listeners) l();
};

function getSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.motion === "off";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    setAttr(e.newValue === "off" ? true : e.newValue === "on" ? false : prefersReducedOS());
    emit();
  };
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMq = () => {
    if (read() === null) {
      setAttr(mq.matches);
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  mq.addEventListener("change", onMq);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", onMq);
  };
}

function setAttr(reduced: boolean) {
  document.documentElement.dataset.motion = reduced ? "off" : "on";
}
function prefersReducedOS(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function read(): Stored | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}
function write(v: Stored | null) {
  try {
    if (v === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, v);
  } catch {
    /* private mode — non-fatal */
  }
}
