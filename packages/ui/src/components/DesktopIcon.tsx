"use client";

import { cn } from "../lib/cn";

type Props = {
  icon: string;
  label: string;
  onOpen: () => void;
  className?: string;
};

/** A labelled launcher on the desktop. Activates with click, Enter or Space. */
export function DesktopIcon({ icon, label, onOpen, className }: Props) {
  return (
    <button
      type="button"
      className={cn("rd-icon", className)}
      onClick={onOpen}
      onDoubleClick={onOpen}
    >
      <span className="rd-icon__glyph" aria-hidden="true">
        {icon}
      </span>
      <span className="rd-icon__label">{label}</span>
    </button>
  );
}
