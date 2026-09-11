import { useCallback, useEffect, useRef, useState } from "react";

import { applyConsent, type Consent, readConsent } from "./consent";

// Matches the splash and the gallery's loading curtain — Baskerville on
// charcoal, a tracked eyebrow, a hairline rule and outline-pill actions.
const SERIF = { fontFamily: "var(--font-baskerville), Georgia, serif" } as const;

// Bottom-right on every route: the minimap owns the top-right of the gallery,
// the joystick the bottom-left, and the inspect bar the bottom-centre.
const ANCHOR =
  "fixed right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 text-[#f3efe6]";

const PILL =
  "flex-1 rounded-full border border-white/25 px-5 py-2.5 text-sm tracking-wide text-white/90 transition-colors hover:border-white/50 hover:bg-white/10";

export function CookieBanner() {
  // Nothing on the server: consent lives in localStorage, and rendering the
  // banner into the SSR HTML would flash it at visitors who already answered.
  const [choice, setChoice] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const reopened = useRef(false);

  useEffect(() => {
    const consent = readConsent();
    setChoice(consent);
    setOpen(consent === null);
    setReady(true);
  }, []);

  // Only pull focus when the visitor asked for the banner; on first load it
  // shouldn't steal focus from the page.
  useEffect(() => {
    if (open && reopened.current) panel.current?.focus();
  }, [open]);

  const choose = useCallback((consent: Consent) => {
    applyConsent(consent);
    setChoice(consent);
    setOpen(false);
  }, []);

  if (!ready) return null;

  // Withdrawing has to be as easy as granting, so the way back is a permanent
  // control rather than something buried in a policy page.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          reopened.current = true;
          setOpen(true);
        }}
        className={`${ANCHOR} rounded-full px-3 py-1.5 text-xs tracking-wide text-white/35 mix-blend-difference transition-colors hover:text-white/80`}
        style={SERIF}
      >
        Cookies
      </button>
    );
  }

  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="cookies-title"
      className={`${ANCHOR} w-[min(24rem,calc(100vw-1.5rem))] rounded-lg bg-[#141210] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10`}
      style={SERIF}
    >
      <p id="cookies-title" className="text-xs uppercase tracking-[0.4em] text-white/50">
        Cookies
      </p>
      <div className="mt-3 h-px w-full bg-white/15" />
      <p className="mt-3 text-sm leading-relaxed text-white/70">
        I'd like to count visits and see which photographs people open, which needs a cookie. It's
        off unless you say yes — no advertising, no cross-site tracking, nothing sold on. The
        gallery works exactly the same either way.
        {choice ? (
          <em className="not-italic text-white/40"> Currently: analytics {choice}.</em>
        ) : null}
      </p>
      {/* Same pill, same size, same order of prominence — refusing must be no
          harder than accepting (GDPR / EDPB dark-pattern guidance). */}
      <div className="mt-5 flex gap-3">
        <button type="button" className={PILL} onClick={() => choose("denied")}>
          Decline
        </button>
        <button type="button" className={PILL} onClick={() => choose("granted")}>
          Accept
        </button>
      </div>
    </div>
  );
}
