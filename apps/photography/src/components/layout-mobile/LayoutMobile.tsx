import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { Menu } from "@headlessui/react";
import Link from "next/link";

import { LayoutMobileProvider, useLayoutMobileContext } from "./LayoutMobile.context";

export const LayoutMobile = ({ children, className, as = "div", ...rest }: ComponentProps<typeof Menu>) => {
  return (
    <LayoutMobileProvider>
      <Menu as={as} className={twMerge("relative block md:hidden", className)} {...rest}>
        {children}
      </Menu>
    </LayoutMobileProvider>
  );
};

export const LayoutMobileNavigation = ({ children, className, ...rest }: ComponentProps<"div">) => {
  return (
    <div className={twMerge("gap sticky top-0 z-10 flex w-full justify-between p-2", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutMobileDrawer = ({ children, className, as = "div", ...rest }: ComponentProps<typeof Menu.Items>) => {
  const { popper, setPopperElement } = useLayoutMobileContext();

  return (
    <Menu.Items
      as={as}
      className={twMerge("text-md mt-2 flex w-full flex-col rounded-sm border font-bold", className)}
      ref={setPopperElement}
      style={popper.styles.popper}
      {...popper.attributes.popper}
      {...rest}
    >
      {children}
    </Menu.Items>
  );
};

export const LayoutMobileDrawerItem = ({
  children,
  className,
  ...rest
}: ComponentProps<typeof Menu.Item> & ComponentProps<typeof Link>) => {
  return (
    <Menu.Item as={Link} className={twMerge("p-4 hover:bg-slate-100", className)} {...rest}>
      {children}
    </Menu.Item>
  );
};

export const LayoutMobileDrawerButton = ({ children, className, ...rest }: ComponentProps<typeof Menu.Button>) => {
  const { setReferenceElement } = useLayoutMobileContext();

  return (
    <Menu.Button className={twMerge("", className)} ref={setReferenceElement} {...rest}>
      {children}
    </Menu.Button>
  );
};

export const LayoutMobileTitle = ({ children, className, ...rest }: ComponentProps<"div">) => {
  return (
    <div className={twMerge("grid gap-0 px-2 text-center", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutMobileHeading = ({ children, className, ...rest }: ComponentProps<"div">) => {
  return (
    <div className={twMerge("text-xl font-bold", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutMobileSubheading = ({ children, className, ...rest }: ComponentProps<"div">) => {
  return (
    <div className={twMerge("text-xs font-light", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutMobileBody = ({ children, className, ...rest }: ComponentProps<"main">) => {
  return (
    <main className={twMerge("w-full p-2 tracking-normal", className)} {...rest}>
      {children}
    </main>
  );
};
