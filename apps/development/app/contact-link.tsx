"use client";

import posthog from "posthog-js";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ContactLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children?: ReactNode;
}

export function ContactLink({ href = "", children, ...rest }: ContactLinkProps) {
  const external = /^https?:\/\//.test(href);

  const handleClick = () => {
    if (external) {
      const label = typeof children === "string" ? children : href;
      posthog.capture("contact_link_clicked", { link_url: href, link_label: label });
    }
  };

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
      onClick={handleClick}
    >
      {children}
      {external ? <span aria-hidden="true"> ↗</span> : null}
    </a>
  );
}
