"use client";

import posthog from "posthog-js";
import type { ReactNode } from "react";

interface ProjectLinkProps {
  href?: string;
  title: string;
  children: ReactNode;
}

export function ProjectLink({ href, title, children }: ProjectLinkProps) {
  const handleClick = () => {
    if (href) {
      posthog.capture("project_link_clicked", { project_title: title, project_url: href });
    }
  };

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
      {children}
    </a>
  );
}
