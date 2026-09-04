"use client";

import { useEffect, useRef } from "react";

/**
 * Neon pointer: a bright core that tracks the cursor 1:1 plus a ring that
 * trails it with a little easing. Hidden on coarse pointers. The rAF loop only
 * runs while the ring is still catching up, then stops.
 */
export function GlowCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-glow-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let running = false;

    const tick = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      const settled = Math.abs(x - rx) < 0.1 && Math.abs(y - ry) < 0.1;
      if (settled) {
        rx = x;
        ry = y;
      }
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (settled) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      kick();
    };
    const onDown = () => root.classList.add("glow-cursor-down");
    const onUp = () => root.classList.remove("glow-cursor-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    kick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.classList.remove("has-glow-cursor", "glow-cursor-down");
    };
  }, []);

  return (
    <div className="crt-cursor" aria-hidden="true">
      <div ref={ringRef} className="crt-cursor__ring" />
      <div ref={dotRef} className="crt-cursor__dot" />
    </div>
  );
}
