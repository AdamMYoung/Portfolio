"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useId,
  useRef,
  useState,
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
};

const STEP = 16;

export function Window({
  id,
  title,
  icon,
  children,
  modal = false,
  initial,
  width = 460,
  height = 380,
}: Props) {
  const { isOpen, close, focus, toggleMinimize, zIndexOf, focusedId, stack } = useWindows();
  const ref = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const cascade = Math.max(0, zIndexOf(id)) * 26;
  const [pos, setPos] = useState(() => initial ?? { x: 120 + cascade, y: 90 + cascade });
  const [maximized, setMaximized] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const open = isOpen(id);
  const minimized = stack.find((w) => w.id === id)?.minimized ?? false;
  const focused = focusedId === id;

  const toggleMaximize = useCallback(() => {
    setMaximized((m) => !m);
    focus(id);
  }, [focus, id]);

  useFocusTrap(ref, open && !minimized && modal);

  const clampToViewport = useCallback(
    (x: number, y: number) => {
      const pad = 8;
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 48;
      return {
        x: Math.min(Math.max(x, -width + 140), Math.min(maxX, window.innerWidth - pad)),
        y: Math.min(Math.max(y, pad), maxY),
      };
    },
    [width]
  );

  const onTitlePointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    focus(id);
    if (maximized) return;
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

  const style: CSSProperties = maximized
    ? { inset: 0, width: "auto", height: "auto", zIndex: 100 + zIndexOf(id) }
    : { left: pos.x, top: pos.y, width, height, zIndex: 100 + zIndexOf(id) };

  return (
    <div
      ref={ref}
      className={cn("rd-window", focused && "rd-window--focused", maximized && "rd-window--max")}
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
        onDoubleClick={toggleMaximize}
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
            _
          </button>
          <button
            type="button"
            className="rd-window__btn"
            onClick={toggleMaximize}
            aria-pressed={maximized}
            aria-label={maximized ? `Restore ${title}` : `Maximise ${title}`}
          >
            {maximized ? "❐" : "▢"}
          </button>
          <button
            type="button"
            className="rd-window__btn rd-window__btn--close"
            onClick={() => close(id)}
            aria-label={`Close ${title}`}
          >
            ×
          </button>
        </span>
      </div>
      <div className="rd-window__body">{children}</div>
    </div>
  );
}
