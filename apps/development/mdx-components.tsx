import type { MDXComponents } from "mdx/types";
import { ContactLink } from "@/app/contact-link";

/**
 * Global MDX element mapping. Styling for prose inside the CRT screen and inside
 * retro windows is handled by CSS (`.crt-screen__content`, `.rd-window__body`),
 * so this stays mostly pass-through — we only harden link security here and
 * wire in PostHog contact-link tracking.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: (props) => <ContactLink {...props} />,
  };
}
