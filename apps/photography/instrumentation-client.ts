import posthog from "posthog-js";
import { applyConsent, readConsent } from "./src/components/consent/consent";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken || !host) {
  if (process.env.NODE_ENV !== "production") {
    const missingVariable = projectToken
      ? "NEXT_PUBLIC_POSTHOG_HOST"
      : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";

    console.error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-01-30",
    debug: process.env.NODE_ENV === "development",
    // No cookies, no storage and no events until the banner says so. Flags are
    // off outright: unused here, and the /flags call fires (with a generated
    // distinct id) before the visitor has chosen. Exception capture is turned
    // on with consent too (see applyConsent) — enabling it here fetches
    // PostHog's exception-autocapture bundle from their CDN on load, and that
    // request alone hands them the visitor's IP before they've agreed.
    opt_out_capturing_by_default: true,
    persistence: "memory",
    // Explicitly false, not merely omitted: the `defaults` preset above turns
    // exception capture on.
    capture_exceptions: false,
    advanced_disable_flags: true,
  });

  const consent = readConsent();
  if (consent) applyConsent(consent, false);
}
