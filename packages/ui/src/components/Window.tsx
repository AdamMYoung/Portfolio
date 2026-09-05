"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { cn } from "../lib/cn";
import { useWindows } from "./WindowManager";

type Props = {
  id: string;
  title: string;
  icon?: string;
  children: ReactNode;
  /** Trap focus + set aria-modal. Use for dialogs; leave off for panels. */
  modal?: boolean;
  initial?: { x: number; y: number };
  width?: number;
  height?: number;
  className?: string;
};

const STEP = 16;

const COARSE_QUERY = "(hover: none), (pointer: coarse)";
/** No real pointer to drag a titlebar with, and not enough screen to make a
 *  windowed/maximised distinction meaningful — windows are just full-screen. */
function useCoarsePointer() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(COARSE_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(COARSE_QUERY).matches,
    () => false
  );
}

export function Window({
  id,
  title,
  icon,
  children,
  modal = false,
  initial,
  width = 460,
  height = 380,
  className,
}: Props) {
  const { isOpen, close, focus, toggleMinimize, zIndexOf, focusedId, stack } = useWindows();
  const ref = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const touch = useCoarsePointer();

  const cascade = Math.max(0, zIndexOf(id)) * 26;
  const [pos, setPos] = useState(() => initial ?? { x: 120 + cascade, y: 90 + cascade });
  const [maximized, setMaximized] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const open = isOpen(id);
  const minimized = stack.find((w) => w.id === id)?.minimized ?? false;
  const focused = focusedId === id;
  const fullScreen = maximized || touch;

  const toggleMaximize = useCallback(() => {
    setMaximized((m) => !m);
    focus(id);
  }, [focus, id]);

  useFocusTrap(ref, open && !minimized && modal);

  // Clamp against the real desktop surface (the window's positioned
  // ancestor), not the browser viewport — on a narrow/mobile screen the CRT
  // screen is much smaller than the window, so viewport-based clamping let
  // windows get dragged (or open) partly off the surface and clipped. Keeps
  // the whole (width/height-capped) window inside the surface whenever it
  // fits, rather than only guaranteeing a sliver stays visible.
  const clampToViewport = useCallback(
    (x: number, y: number) => {
      const bounds = ref.current?.offsetParent as HTMLElement | null;
      const boundsW = bounds?.clientWidth ?? window.innerWidth;
      const boundsH = bounds?.clientHeight ?? window.innerHeight;
      const effW = Math.min(width, boundsW);
      const effH = Math.min(height, boundsH);
      const maxX = Math.max(0, boundsW - effW);
      const maxY = Math.max(0, boundsH - effH);
      return {
        x: Math.min(Math.max(x, 0), maxX),
        y: Math.min(Math.max(y, 0), maxY),
      };
    },
    [width, height]
  );

  // Correct the position whenever the window opens: it always exists in the
  // tree (this component just renders null while closed), so a mount-only
  // effect would run once before `ref` is ever attached and never again. An
  // initial position sized for a wide desktop can start partly off-surface
  // on a small screen — this pulls it back in bounds each time it's shown.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-clamp on open, not on every position change
  useEffect(() => {
    if (!open || !ref.current) return;
    setPos((p) => clampToViewport(p.x, p.y));
  }, [open]);

  const onTitlePointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    focus(id);
    if (fullScreen) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onTitlePointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    setPos(clampToViewport(e.clientX - drag.current.dx, e.clientY - drag.current.dy));
  };
  const onTitlePointerUp = (e: ReactPointerEvent) => {
    drag.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      close(id);
      return;
    }
    if (e.target !== e.currentTarget) return; // only when the titlebar itself is focused
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, -STEP],
      ArrowDown: [0, STEP],
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      setPos((p) => clampToViewport(p.x + move[0], p.y + move[1]));
    }
  };

  if (!open) return null;

  const style: CSSProperties = fullScreen
    ? { inset: 0, width: "auto", height: "auto", zIndex: 100 + zIndexOf(id) }
    : { left: pos.x, top: pos.y, width, height, zIndex: 100 + zIndexOf(id) };

  return (
    <div
      ref={ref}
      className={cn(
        "rd-window",
        focused && "rd-window--focused",
        fullScreen && "rd-window--max",
        className
      )}
      style={style}
      role="dialog"
      aria-modal={modal || undefined}
      aria-labelledby={labelId}
      hidden={minimized}
      onPointerDownCapture={() => focus(id)}
      onKeyDown={onKeyDown}
    >
      <div
        className="rd-window__titlebar"
        role="toolbar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onDoubleClick={touch ? undefined : toggleMaximize}
        tabIndex={0}
        aria-label={`${title} — drag or use arrow keys to move`}
      >
        <span className="rd-window__title" id={labelId}>
          {icon ? <span aria-hidden="true">{icon} </span> : null}
          {title}
        </span>
        <span className="rd-window__controls">
          <button
            type="button"
            className="rd-window__btn"
            onClick={() => toggleMinimize(id)}
            aria-label={`Minimise ${title}`}
          >
            <span className="rd-window__ico rd-window__ico--min" aria-hidden="true" />
          </button>
          {touch ? null : (
            <button
              type="button"
              className="rd-window__btn"
              onClick={toggleMaximize}
              aria-pressed={maximized}
              aria-label={maximized ? `Restore ${title}` : `Maximise ${title}`}
            >
              <span
                className={`rd-window__ico rd-window__ico--${maximized ? "restore" : "max"}`}
                aria-hidden="true"
              />
            </button>
          )}
          <button
            type="button"
            className="rd-window__btn rd-window__btn--close"
            onClick={() => close(id)}
            aria-label={`Close ${title}`}
          >
            <span className="rd-window__ico rd-window__ico--close" aria-hidden="true" />
          </button>
        </span>
      </div>
      <div className="rd-window__body">{children}</div>
    </div>
  );
}
