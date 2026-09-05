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
  /** Coarse (touch) pointers only: whether the visitor has granted/enabled
   *  gyroscope tilt (see `useGyroTilt`). False pins the monitor to centre. */
  gyroActive?: boolean;
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
 * completely. Coarse pointers (touch) ignore finger position entirely —
 * dragging the tilt around on a phone fought the screen's own scrolling —
 * and instead tilt gently with the device's gyroscope (`deviceorientation`),
 * relative to however the phone happened to be held when it first reported
 * an angle. Touch is left free for the screen's own internal scrolling.
 * Whether that gyro listener is actually attached is controlled by
 * `gyroActive` (see `useGyroTilt` / `GyroToggle`) — iOS gates it behind a
 * permission prompt only a real click can trigger, so this hook never
 * requests it itself.
 */
export function useParallaxPan(target: RefObject<HTMLElement | null>, opts: Options = {}) {
  const {
    disabled = false,
    friction = 0.15,
    quietSelector = ".crt-monitor",
    quietZoom = 0.24,
    gyroActive = false,
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

    if (coarse) {
      if (!gyroActive) {
        el.style.setProperty("--pan-x", "0");
        el.style.setProperty("--pan-y", "0");
        el.style.setProperty("--crt-zoom", "1");
        return;
      }

      // Degrees of device tilt (either axis) mapped to the full -1..1 pan
      // range — a wide range so it reads as "gentle drift", not a wobble.
      const tiltRange = 45;
      // Ignore tiny jitter around centre (hand tremor, sensor noise) instead
      // of it constantly nudging the CRT off dead centre. Subtracted rather
      // than clamped to 0 below the threshold, so motion past it is still
      // continuous (no jump the instant it exceeds the dead zone).
      const deadZoneDeg = 2;
      const applyDeadZone = (delta: number) =>
        Math.abs(delta) <= deadZoneDeg ? 0 : delta - Math.sign(delta) * deadZoneDeg;
      // Whatever angle the phone reports first becomes "centre": people
      // hold phones at all sorts of resting angles, so there's no fixed
      // "flat" to calibrate against.
      let baseBeta: number | null = null;
      let baseGamma: number | null = null;

      const onOrientation = (e: DeviceOrientationEvent) => {
        if (e.beta == null || e.gamma == null) return;
        if (baseBeta === null || baseGamma === null) {
          baseBeta = e.beta;
          baseGamma = e.gamma;
        }
        // Tipping the top of the phone forward/away tips the CRT toward the
        // viewer (beta inverted from the raw delta to get that feel); gamma
        // (left/right) maps directly — inverting it the same way as beta
        // actually ran backwards for left/right tilt.
        tx = Math.max(-1, Math.min(1, applyDeadZone(e.gamma - baseGamma) / tiltRange));
        ty = Math.max(-1, Math.min(1, applyDeadZone(e.beta - baseBeta) / tiltRange));
        kick();
      };

      // Permission (iOS) is requested explicitly by `GyroToggle`, which is
      // what flips `gyroActive` true — by the time we're here it's already
      // granted (or not needed), so just listen.
      window.addEventListener("deviceorientation", onOrientation);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("deviceorientation", onOrientation);
      };
    }

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

    const onMove = (e: PointerEvent) => setTarget(e);
    // Pointer genuinely left the page / window lost focus -> fully recentre.
    const recentre = () => {
      tx = 0;
      ty = 0;
      tz = 0;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", recentre);
    document.addEventListener("pointerleave", recentre, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", recentre);
      document.removeEventListener("pointerleave", recentre);
    };
  }, [target, disabled, friction, quietSelector, quietZoom, gyroActive]);
}
