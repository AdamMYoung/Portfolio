import React, { ComponentProps } from "react";
import NextLink from "next/link";
import { twMerge } from "tailwind-merge";

type LinkProps = ComponentProps<typeof NextLink> & { href: string; type?: "external" | "internal" };

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
