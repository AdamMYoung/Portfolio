import React from "react";
import NextLink from "next/link";
import { twMerge } from "tailwind-merge";

import { ElementProps, ExtractProps } from "../../../utils";

type InternalLinkProps = ExtractProps<typeof NextLink> & {
  type?: "internal";
};

type ExternalLinkProps = ElementProps<"a"> & {
  type?: "external";
};

type LinkProps = (InternalLinkProps | ExternalLinkProps) & { href: string };

export const Link = ({ children, className, type = "internal", ...rest }: LinkProps) => {
  const _className = twMerge(typeof children === "string" && "hover:underline", className);

  if (type === "internal") {
    return (
      <NextLink className={_className} {...rest}>
        {children}
      </NextLink>
    );
  }

  return (
    <a className={_className} target="_blank" rel="noreferrer" {...rest}>
      {children}
    </a>
  );
};
