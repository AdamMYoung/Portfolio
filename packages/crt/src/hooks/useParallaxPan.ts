"use client";

import { type RefObject, useEffect } from "react";

type Options = {
  /** When true, pan is pinned to centre and listeners are removed. */
  disabled?: boolean;
  /** Ease factor toward the target per frame (0..1). Higher = snappier. */
  friction?: number;
  /** Pointer over an element matching this selector => don't rotate, zoom in
   *  slightly instead (so the CRT isn't a moving target while you're on it). */
  quietSelector?: string;
  /** Zoom amount applied over the quiet zone (fraction, e.g. 0.04 = +4%). */
  quietZoom?: number;
};

/**
 * Writes `--pan-x` / `--pan-y` (-1..1) and `--crt-zoom` to the target. CSS turns
 * those into ONE compositor-only transform on the monitor and a translate on the
 * backdrop — nothing that forces re-layout or re-projection.
 *
 * Over the quiet zone (the screen) the rotation eases out to 0 and `--crt-zoom`
 * eases in, so the content holds still and pushes gently toward the viewer.
 *
 * The rAF loop only runs while values are still settling; at rest it stops
 * completely. Coarse pointers (touch) pan only during an active drag.
 */
export function useParallaxPan(target: RefObject<HTMLElement | null>, opts: Options = {}) {
  const {
    disabled = false,
    friction = 0.15,
    quietSelector = ".crt-monitor",
    quietZoom = 0.1,
  } = opts;

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    if (disabled) {
      el.style.setProperty("--pan-x", "0");
      el.style.setProperty("--pan-y", "0");
      el.style.setProperty("--crt-zoom", "1");
      return;
    }

    const coarse = window.matchMedia("(hover: none)").matches;
    let tx = 0;
    let ty = 0;
    let tz = 0; // zoom target: 0 = none, 1 = full quietZoom
    let cx = 0;
    let cy = 0;
    let cz = 0;
    let raf = 0;
    let running = false;
    let dragging = !coarse;

    const near = (a: number, b: number) => Math.abs(a - b) < 0.0015;

    const step = () => {
      cx += (tx - cx) * friction;
      cy += (ty - cy) * friction;
      cz += (tz - cz) * friction;
      const settled = near(tx, cx) && near(ty, cy) && near(tz, cz);
      if (settled) {
        cx = tx;
        cy = ty;
        cz = tz;
      }
      el.style.setProperty("--pan-x", cx.toFixed(4));
      el.style.setProperty("--pan-y", cy.toFixed(4));
      el.style.setProperty("--crt-zoom", (1 + cz * quietZoom).toFixed(4));
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

    const setTarget = (e: PointerEvent) => {
      const overScreen = !!(e.target as Element | null)?.closest?.(quietSelector);
      if (overScreen) {
        tx = 0;
        ty = 0;
        tz = 1;
      } else {
        tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
        ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
        tz = 0;
      }
      kick();
    };

    const onMove = (e: PointerEvent) => {
      if (dragging) setTarget(e);
    };
    const onDown = (e: PointerEvent) => {
      if (coarse) dragging = true;
      setTarget(e);
    };
    // Fine pointers: a click must NOT snap the CRT back (that read as a zoom-out
    // on every interaction). Only end a touch drag here; the next pointermove
    // re-evaluates state for mice.
    const onUp = () => {
      if (!coarse) return;
      dragging = false;
      tx = 0;
      ty = 0;
      tz = 0;
      kick();
    };
    // Pointer genuinely left the page / window lost focus -> fully recentre.
    const recentre = () => {
      if (coarse) dragging = false;
      tx = 0;
      ty = 0;
      tz = 0;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", recentre);
    document.addEventListener("pointerleave", recentre, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", recentre);
      document.removeEventListener("pointerleave", recentre);
    };
  }, [target, disabled, friction, quietSelector, quietZoom]);
}
