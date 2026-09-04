"use client";

import { type RefObject, useEffect } from "react";

type Options = {
  /** When true, pan is pinned to centre and listeners are removed. */
  disabled?: boolean;
  /** Ease-back factor per frame when the pointer is idle (0..1). */
  friction?: number;
};

/**
 * Writes normalised pointer position (-1..1) to `--pan-x` / `--pan-y` on the
 * target element. CSS in `styles.css` turns those into monitor tilt + background
 * counter-parallax. rAF-throttled; one style write per frame.
 *
 * Coarse pointers (touch) only pan while a drag is active.
 */
export function useParallaxPan(target: RefObject<HTMLElement | null>, opts: Options = {}) {
  const { disabled = false, friction = 0.12 } = opts;

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    if (disabled) {
      el.style.setProperty("--pan-x", "0");
      el.style.setProperty("--pan-y", "0");
      return;
    }

    const coarse = window.matchMedia("(hover: none)").matches;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let dragging = !coarse;
    let raf = 0;

    const clamp = (n: number) => Math.max(-1, Math.min(1, n));

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const r = el.getBoundingClientRect();
      targetX = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
      targetY = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2));
    };
    const onDown = (e: PointerEvent) => {
      if (coarse) dragging = true;
      onMove(e);
    };
    const onUp = () => {
      if (coarse) dragging = false;
      targetX = 0;
      targetY = 0;
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const tick = () => {
      curX += (targetX - curX) * friction;
      curY += (targetY - curY) * friction;
      if (Math.abs(curX) < 1e-4) curX = 0;
      if (Math.abs(curY) < 1e-4) curY = 0;
      el.style.setProperty("--pan-x", curX.toFixed(4));
      el.style.setProperty("--pan-y", curY.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [target, disabled, friction]);
}
