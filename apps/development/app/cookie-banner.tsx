"use client";

import { Button } from "@portfolio/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { applyConsent, type Consent, OPEN_EVENT, readConsent } from "./consent";

/** Opens the banner again after a choice has been made — GDPR wants
 *  withdrawing consent to be as easy as giving it. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="crt-motion-toggle"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      <span className="crt-motion-toggle__label">Cookies</span>
    </button>
  );
}

export function CookieBanner() {
  // Nothing on the server: consent lives in localStorage, and rendering the
  // banner in the SSR HTML would flash it at visitors who already answered.
  const [shown, setShown] = useState(false);
  const [current, setCurrent] = useState<Consent | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reopened = useRef(false);

  useEffect(() => {
    const consent = readConsent();
    setCurrent(consent);
    setShown(consent === null);

    const onOpen = () => {
      reopened.current = true;
      setCurrent(readConsent());
      setShown(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Only pull focus when the visitor asked for the banner; on first load it
  // shouldn't steal focus from the page.
  useEffect(() => {
    if (shown && reopened.current) ref.current?.focus();
  }, [shown]);

  const choose = useCallback((consent: Consent) => {
    applyConsent(consent);
    setCurrent(consent);
    setShown(false);
  }, []);

  if (!shown) return null;

  return (
    <div className="cookies" role="dialog" aria-labelledby="cookies-title" ref={ref} tabIndex={-1}>
      <p className="cookies__title" id="cookies-title">
        <span aria-hidden="true">▚</span> Cookies
      </p>
      <p className="cookies__body">
        I'd like to use PostHog to count visits and see which windows people open, which needs a
        cookie. It's off unless you say yes — no advertising, no cross-site tracking, nothing sold
        on. The site works exactly the same either way.
        {current ? <em className="cookies__current"> Currently: analytics {current}.</em> : null}
      </p>
      <div className="cookies__actions">
        <Button onClick={() => choose("denied")}>Reject</Button>
        <Button onClick={() => choose("granted")}>Accept</Button>
      </div>
    </div>
  );
}
