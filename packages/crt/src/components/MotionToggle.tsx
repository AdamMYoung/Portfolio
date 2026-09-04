"use client";

import { useMotionPreference } from "../hooks/useMotionPreference";

type Props = {
  className?: string;
};

/** Accessible switch that freezes/enables all stage animation. Reflects the OS
 *  default until the visitor makes an explicit choice. */
export function MotionToggle({ className }: Props) {
  const { reduced, toggle } = useMotionPreference();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!reduced}
      onClick={toggle}
      className={`crt-motion-toggle${className ? ` ${className}` : ""}`}
      data-on={!reduced}
    >
      <span className="crt-motion-toggle__track" aria-hidden="true">
        <span className="crt-motion-toggle__thumb" />
      </span>
      <span className="crt-motion-toggle__label">{reduced ? "Motion: off" : "Motion: on"}</span>
    </button>
  );
}
