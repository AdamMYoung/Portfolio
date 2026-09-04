import type { MDXComponents } from "mdx/types";

/**
 * Global MDX element mapping. Styling for prose inside the CRT screen and inside
 * retro windows is handled by CSS (`.crt-screen__content`, `.rd-window__body`),
 * so this stays mostly pass-through — we only harden link security here.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: ({ href = "", children, ...rest }) => {
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...rest}
        >
          {children}
          {external ? <span aria-hidden="true"> ↗</span> : null}
        </a>
      );
    },
  };
}
