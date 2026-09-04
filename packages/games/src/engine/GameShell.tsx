"use client";

import type { Application } from "pixi.js";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

export type InputState = {
  /** -1 / 0 / 1 on each axis — held state, for continuous movement. */
  x: number;
  y: number;
  /** true for one frame after a fire press. */
  fire: boolean;
  /** Directions pressed since the last frame — for discrete/tap input.
   *  Values: "up" | "down" | "left" | "right". Cleared after each tick. */
  pressed: Set<string>;
};

export type GameHandle = {
  /** Called once per rAF frame with delta seconds and current input. */
  tick: (dt: number, input: InputState) => void;
  destroy: () => void;
  /** Optional: react to a pause/resume. */
  setPaused?: (paused: boolean) => void;
};

type Props = {
  title: string;
  instructions: string;
  /** Build the game against an initialised Pixi app. */
  create: (app: Application, announce: (msg: string) => void) => GameHandle | Promise<GameHandle>;
  /** Show the on-screen dpad + fire button (touch). */
  touchControls?: "dpad" | "horizontal" | "none";
  aspect?: number;
};

/**
 * Shared harness for the easter-egg games. Owns the Pixi lifecycle, the rAF
 * loop, pause-on-hidden, keyboard + touch input, and the accessibility shell
 * (labelled application region, live score/status announcements, visible
 * controls). Each game file stays tiny and framework-free.
 *
 * Pixi is only imported here, and this module is only ever reached through a
 * `dynamic(() => import("@portfolio/games/<game>"), { ssr: false })` call, so
 * the ~350 kB renderer never touches the initial bundle.
 */
export function GameShell({
  title,
  instructions,
  create,
  touchControls = "dpad",
  aspect = 1,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const input = useRef<InputState>({ x: 0, y: 0, fire: false, pressed: new Set() });
  const keys = useRef<Set<string>>(new Set());
  const [status, setStatus] = useState("Loading…");
  const [paused, setPausedState] = useState(false);
  const pausedRef = useRef(false);
  const handleRef = useRef<GameHandle | null>(null);

  const announce = useCallback((msg: string) => setStatus(msg), []);

  const setPaused = useCallback((next: boolean) => {
    pausedRef.current = next;
    setPausedState(next);
    handleRef.current?.setPaused?.(next);
  }, []);

  // --- keyboard -----------------------------------------------------
  useEffect(() => {
    const readAxes = () => {
      const k = keys.current;
      const left = k.has("ArrowLeft") || k.has("a");
      const right = k.has("ArrowRight") || k.has("d");
      const up = k.has("ArrowUp") || k.has("w");
      const down = k.has("ArrowDown") || k.has("s");
      input.current.x = (right ? 1 : 0) - (left ? 1 : 0);
      input.current.y = (down ? 1 : 0) - (up ? 1 : 0);
    };
    const DIR: Record<string, string> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    const onDown = (e: KeyboardEvent) => {
      if (!hostRef.current?.contains(document.activeElement)) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === " " || e.key === "Enter") input.current.fire = true;
      if (e.key.toLowerCase() === "p") setPaused(!pausedRef.current);
      const norm = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const dir = DIR[norm];
      if (dir) input.current.pressed.add(dir);
      keys.current.add(norm);
      readAxes();
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      readAxes();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [setPaused]);

  // --- pixi lifecycle + loop -----------------------------------------
  // The frame loop is Pixi's own ticker: it starts with the app and is torn
  // down by `app.destroy()`, so a StrictMode double-mount can't leave an
  // orphaned rAF running against a destroyed renderer.
  useEffect(() => {
    let cancelled = false;
    let app: Application | null = null;
    let handle: GameHandle | null = null;

    (async () => {
      const { Application: PixiApp } = await import("pixi.js");
      const host = hostRef.current;
      if (cancelled || !host) return;

      const instance = new PixiApp();
      await instance.init({
        antialias: true,
        backgroundAlpha: 0,
        resizeTo: host,
        autoDensity: true,
        resolution: Math.min(2, window.devicePixelRatio || 1),
      });
      if (cancelled) {
        instance.destroy(true, { children: true });
        return;
      }
      app = instance;
      host.appendChild(instance.canvas);
      instance.canvas.setAttribute("aria-hidden", "true");

      handle = await create(instance, announce);
      if (cancelled) {
        handle?.destroy();
        instance.destroy(true, { children: true });
        return;
      }
      handleRef.current = handle;
      setStatus((s) => (s === "Loading…" ? "Ready — press an arrow key to start" : s));

      instance.ticker.add((ticker) => {
        if (pausedRef.current || document.hidden || !handle) return;
        const dt = Math.min(0.05, ticker.deltaMS / 1000);
        handle.tick(dt, input.current);
        input.current.fire = false;
        input.current.pressed.clear();
      });
    })();

    // No explicit pause-on-hidden: the ticker callback already skips work while
    // `document.hidden`, and resumes on its own when the tab is shown again.
    return () => {
      cancelled = true;
      handleRef.current = null;
      handle?.destroy();
      app?.destroy(true, { children: true });
    };
  }, [create, announce]);

  // --- touch dpad ----------------------------------------------
  const hold = (axis: "x" | "y", value: number) => {
    const dir = axis === "x" ? (value < 0 ? "left" : "right") : value < 0 ? "up" : "down";
    return {
      onPointerDown: () => {
        input.current[axis] = value;
        input.current.pressed.add(dir);
      },
      onPointerUp: () => {
        input.current[axis] = 0;
      },
      onPointerLeave: () => {
        input.current[axis] = 0;
      },
    };
  };

  return (
    <div className="pg-game">
      <div
        ref={hostRef}
        className="pg-game__stage"
        role="application"
        aria-label={`${title}. ${instructions}`}
        aria-roledescription="game"
        tabIndex={0}
        onPointerDown={() => hostRef.current?.focus()}
        style={{ "--pg-aspect": aspect } as CSSProperties}
      />
      <p className="pg-game__status" role="status" aria-live="polite">
        {status}
      </p>
      <div className="pg-game__bar">
        <button
          type="button"
          className="rd-btn"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <span className="pg-game__hint">{instructions}</span>
      </div>

      {touchControls !== "none" && (
        <div className={`pg-dpad pg-dpad--${touchControls}`} aria-hidden="true">
          {touchControls === "dpad" && (
            <button type="button" className="pg-dpad__btn pg-dpad__up" {...hold("y", -1)}>
              ▲
            </button>
          )}
          <button type="button" className="pg-dpad__btn pg-dpad__left" {...hold("x", -1)}>
            ◀
          </button>
          <button
            type="button"
            className="pg-dpad__btn pg-dpad__fire"
            onPointerDown={() => {
              input.current.fire = true;
            }}
          >
            ●
          </button>
          <button type="button" className="pg-dpad__btn pg-dpad__right" {...hold("x", 1)}>
            ▶
          </button>
          {touchControls === "dpad" && (
            <button type="button" className="pg-dpad__btn pg-dpad__down" {...hold("y", 1)}>
              ▼
            </button>
          )}
        </div>
      )}
    </div>
  );
}
