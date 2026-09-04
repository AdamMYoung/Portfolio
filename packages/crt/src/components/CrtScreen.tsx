"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  /** Accessible name for the screen's scrollable content region. */
  label?: string;
  /** Text shown on the bezel. */
  badge?: string;
  className?: string;
};

const prefersReducedMotion = () =>
  typeof document !== "undefined" &&
  (document.documentElement.dataset.motion === "off" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

/** The tube: plastic case, glass, scanlines, shadow-mask, TV static, flicker +
 *  hum bar, glass sheen, a power-on sweep on mount, and a working power button
 *  (bottom-right of the bezel) with the classic collapse-to-a-dot power-off. */
export function CrtScreen({
  children,
  label = "Screen contents",
  badge = "AY-1984",
  className,
}: Props) {
  const [booting, setBooting] = useState(true);
  const [powered, setPowered] = useState(true);
  const bootTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setBooting(false);
      return;
    }
    bootTimer.current = setTimeout(() => setBooting(false), 640);
    return () => clearTimeout(bootTimer.current);
  }, []);

  const togglePower = useCallback(() => {
    setPowered((on) => {
      const next = !on;
      clearTimeout(bootTimer.current);
      if (next) {
        if (prefersReducedMotion()) {
          setBooting(false);
        } else {
          setBooting(true);
          bootTimer.current = setTimeout(() => setBooting(false), 700);
        }
      }
      return next;
    });
  }, []);

  const screenClass = [
    "crt-screen",
    booting && powered ? "crt-screen--booting" : "",
    powered ? "" : "crt-screen--off",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`crt-monitor${className ? ` ${className}` : ""}`}>
      <div className="crt-monitor__case" aria-hidden="true">
        <div className="crt-face--back" />
        <div className="crt-wall crt-wall--t" />
        <div className="crt-wall crt-wall--b" />
        <div className="crt-wall crt-wall--l" />
        <div className="crt-wall crt-wall--r" />
        <div className="crt-monitor__baffle" />
      </div>

      <div className="crt-face--front">
        <div className={screenClass}>
          <section
            className="crt-screen__content"
            aria-label={label}
            aria-hidden={!powered || undefined}
            tabIndex={powered ? 0 : -1}
          >
            {children}
          </section>
          <div className="crt-screen__mask" aria-hidden="true" />
          <div className="crt-screen__scanlines" aria-hidden="true" />
          <div className="crt-screen__static" aria-hidden="true" />
          <div className="crt-screen__flicker" aria-hidden="true" />
          <div className="crt-screen__sheen" aria-hidden="true" />
          <div className="crt-screen__off" aria-hidden="true" />
        </div>
        <div className="crt-monitor__panel">
          <button
            type="button"
            className="crt-power"
            aria-pressed={powered}
            aria-label={powered ? "Turn the monitor off" : "Turn the monitor on"}
            onClick={togglePower}
          />
          <span
            className="crt-monitor__led"
            data-power={powered ? "on" : "off"}
            aria-hidden="true"
          />
          <span className="crt-monitor__badge" aria-hidden="true">
            {badge}
          </span>
        </div>
      </div>

      <div className="crt-monitor__stand" aria-hidden="true" />
      <div className="crt-monitor__shadow" aria-hidden="true" />
    </div>
  );
}
