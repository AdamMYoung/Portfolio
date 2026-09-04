"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Clock } from "./Clock";
import { useWindows } from "./WindowManager";

type Props = {
  /** Right-hand tray slot — e.g. the motion toggle. */
  tray?: ReactNode;
  brand?: string;
};

export function Taskbar({ tray, brand = "AY//OS" }: Props) {
  const { stack, focusedId, focus, toggleMinimize } = useWindows();

  return (
    <nav className="rd-taskbar" aria-label="Open windows">
      <span className="rd-taskbar__brand">{brand}</span>
      <ul className="rd-taskbar__list">
        {stack.map((w) => {
          const active = focusedId === w.id && !w.minimized;
          return (
            <li key={w.id}>
              <button
                type="button"
                className={cn("rd-taskbar__item", active && "rd-taskbar__item--active")}
                aria-pressed={active}
                onClick={() => (active ? toggleMinimize(w.id) : focus(w.id))}
              >
                {w.icon ? <span aria-hidden="true">{w.icon} </span> : null}
                {w.title}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="rd-taskbar__tray">
        {tray}
        <Clock />
      </div>
    </nav>
  );
}
