import posthog from "posthog-js";

/** GDPR: analytics is off until the visitor says yes. PostHog is initialised
 *  opted-out with in-memory persistence (see instrumentation-client.ts), so
 *  nothing is stored or sent before consent — and a refusal is remembered
 *  without setting any of PostHog's own cookies. */
export type Consent = "granted" | "denied";

const KEY = "ay-analytics-consent";

export const readConsent = (): Consent | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null; // storage blocked — treat as "not asked yet"
  }
};

export function applyConsent(consent: Consent, remember = true) {
  if (remember) {
    try {
      localStorage.setItem(KEY, consent);
    } catch {}
  }
  if (consent === "granted") {
    posthog.set_config({ persistence: "localStorage+cookie", capture_exceptions: true });
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
    posthog.set_config({ persistence: "memory", capture_exceptions: false });
  }
}

/** Reopens the banner from the stage controls. A plain DOM event keeps the
 *  button and the banner independent — they're in different trees. */
export const OPEN_EVENT = "ay:cookie-settings";
