"use client";

import { useEffect, useRef } from "react";

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF<>=*+#$%&@ｦｧｨｩｪ".split(
    ""
  );
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0] ?? "0";

/** Matrix digital rain on a 2D canvas. Decorative — no PixiJS. Pauses when the
 *  window is hidden; slows right down under reduced motion. */
export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    let w = 0;
    let h = 0;
    let cell = 16;
    let drops: number[] = [];

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(12, Math.round(w / 48));
      ctx.font = `${cell}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      const cols = Math.ceil(w / cell);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
      ctx.fillStyle = "#020804";
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const reduced = document.documentElement.dataset.motion === "off";
    const stepMs = reduced ? 140 : 48;
    let raf = 0;
    let last = 0;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || t - last < stepMs) return;
      last = t;

      ctx.fillStyle = "rgba(2, 8, 4, 0.16)";
      ctx.fillRect(0, 0, w, h);

      for (const [i, row] of drops.entries()) {
        const x = i * cell;
        const y = row * cell;
        ctx.fillStyle = "#e6ffe9";
        ctx.fillText(glyph(), x, y);
        ctx.fillStyle = "#25f08a";
        ctx.fillText(glyph(), x, y - cell * 2);
        drops[i] = y > h && Math.random() > 0.972 ? Math.random() * -18 : row + 1;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="mx" role="img" aria-label="The Matrix digital-rain screensaver">
      <canvas ref={ref} className="mx__canvas" />
      <span className="mx__tag">follow the white rabbit</span>
    </div>
  );
}
