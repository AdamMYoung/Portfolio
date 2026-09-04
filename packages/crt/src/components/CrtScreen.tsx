"use client";

import { type ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  /** Accessible name for the screen's scrollable content region. */
  label?: string;
  /** Text shown on the bezel. */
  badge?: string;
  className?: string;
};

/** The tube: plastic shell, curved glass, scanlines, shadow-mask, TV static,
 *  flicker + hum bar, glass sheen, and a power-on sweep on mount. Content is
 *  a normal scrollable region so keyboard + screen-reader users are unaffected
 *  by the effects layered above it. */
export function CrtScreen({
  children,
  label = "Screen contents",
  badge = "AY-1984",
  className,
}: Props) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const prefersReduced =
      document.documentElement.dataset.motion === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setBooting(false);
      return;
    }
    const t = setTimeout(() => setBooting(false), 640);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`crt-monitor${className ? ` ${className}` : ""}`}>
      <div className="crt-monitor__case" aria-hidden="true">
        <div className="crt-face--back" />
        <div className="crt-wall crt-wall--t" />
        <div className="crt-wall crt-wall--b" />
        <div className="crt-wall crt-wall--l" />
        <div className="crt-wall crt-wall--r" />
      </div>

      <div className="crt-face--front">
        <div className={`crt-screen${booting ? " crt-screen--booting" : ""}`}>
          <section className="crt-screen__content" aria-label={label} tabIndex={0}>
            {children}
          </section>
          <div className="crt-screen__mask" aria-hidden="true" />
          <div className="crt-screen__scanlines" aria-hidden="true" />
          <div className="crt-screen__static" aria-hidden="true" />
          <div className="crt-screen__flicker" aria-hidden="true" />
          <div className="crt-screen__sheen" aria-hidden="true" />
        </div>
        <span className="crt-monitor__badge" aria-hidden="true">
          {badge}
        </span>
        <span className="crt-monitor__led" aria-hidden="true" />
      </div>

      <div className="crt-monitor__stand" aria-hidden="true" />
      <div className="crt-monitor__shadow" aria-hidden="true" />
    </div>
  );
}
