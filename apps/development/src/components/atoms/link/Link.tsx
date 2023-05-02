/* eslint-disable jsx-a11y/anchor-is-valid */
import NextLink from "next/link";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { ElementProps } from "ui";

const StyledLink = forwardRef<HTMLAnchorElement, ElementProps<"a">>(
  ({ children, href, className, target = "", ...rest }, ref) => {
    const _className = twMerge("font-medium text-blue-600 underline hover:no-underline", className);

    return (
      <a ref={ref} href={href} className={_className} target={target} {...rest}>
        {children}
      </a>
    );
  }
);

StyledLink.displayName = "StyledLink";

export const Link = ({ children, href = "", ...rest }: ElementProps<"a">) => {
  const sanitizedHref = decodeURI(href).replace(/<\/?[^>]+(>|$)/g, "");

  if (sanitizedHref?.startsWith("/") || sanitizedHref?.startsWith("#")) {
    return (
      <NextLink href={sanitizedHref} passHref legacyBehavior>
        <StyledLink {...rest}>{children}</StyledLink>
      </NextLink>
    );
  }

  return (
    <StyledLink href={sanitizedHref} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </StyledLink>
  );
};
