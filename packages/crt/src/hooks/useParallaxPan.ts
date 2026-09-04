"use client";

import { type RefObject, useEffect } from "react";

type Options = {
  /** When true, pan is pinned to centre and listeners are removed. */
  disabled?: boolean;
  /** Ease factor toward the target per frame (0..1). Higher = snappier. */
  friction?: number;
};

/**
 * Writes normalised pointer position (-1..1) to `--pan-x` / `--pan-y` on the
 * target. CSS turns those into ONE compositor-only transform on the monitor and
 * a translate on the backdrop — nothing that forces re-layout or re-projection.
 *
 * The rAF loop only runs while the value is still settling toward the pointer;
 * at rest it stops completely, so an idle page does zero per-frame work.
 * Coarse pointers (touch) pan only during an active drag.
 */
export function useParallaxPan(target: RefObject<HTMLElement | null>, opts: Options = {}) {
  const { disabled = false, friction = 0.15 } = opts;

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    if (disabled) {
      el.style.setProperty("--pan-x", "0");
      el.style.setProperty("--pan-y", "0");
      return;
    }

    const coarse = window.matchMedia("(hover: none)").matches;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;
    let dragging = !coarse;

    const step = () => {
      cx += (tx - cx) * friction;
      cy += (ty - cy) * friction;
      const settled = Math.abs(tx - cx) < 0.0015 && Math.abs(ty - cy) < 0.0015;
      if (settled) {
        cx = tx;
        cy = ty;
      }
      el.style.setProperty("--pan-x", cx.toFixed(4));
      el.style.setProperty("--pan-y", cy.toFixed(4));
      if (settled) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };

    const setTarget = (clientX: number, clientY: number) => {
      tx = Math.max(-1, Math.min(1, (clientX / window.innerWidth) * 2 - 1));
      ty = Math.max(-1, Math.min(1, (clientY / window.innerHeight) * 2 - 1));
      kick();
    };

    const onMove = (e: PointerEvent) => {
      if (dragging) setTarget(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => {
      if (coarse) dragging = true;
      setTarget(e.clientX, e.clientY);
    };
    const recentre = () => {
      if (coarse) dragging = false;
      tx = 0;
      ty = 0;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", recentre, { passive: true });
    window.addEventListener("blur", recentre);
    document.addEventListener("pointerleave", recentre, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", recentre);
      window.removeEventListener("blur", recentre);
      document.removeEventListener("pointerleave", recentre);
    };
  }, [target, disabled, friction]);
}
