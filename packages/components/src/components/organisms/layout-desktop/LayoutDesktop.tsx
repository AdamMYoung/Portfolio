import React from "react";
import { twMerge } from "tailwind-merge";

import { ElementProps } from "../../../utils";

export const LayoutDesktop = ({ children, className, ...rest }: ElementProps<"div">) => {
  return (
    <div
      className={twMerge("hidden h-[100vh] grid-cols-[minmax(0,300px)_1fr] py-2 tracking-widest md:grid", className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export const LayoutDesktopSidebar = ({ children, className, ...rest }: ElementProps<"nav">) => {
  return (
    <nav
      className={twMerge("flex w-full max-w-xl flex-col gap-4 overflow-y-auto p-6 pt-12 font-bold", className)}
      {...rest}
    >
      {children}
    </nav>
  );
};

export const LayoutDesktopNavigation = ({ children, className, ...rest }: ElementProps<"div">) => {
  return (
    <div className={twMerge("flex flex-col gap-6 px-2", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutDesktopTitle = ({ children, className, ...rest }: ElementProps<"div">) => {
  return (
    <div className={twMerge("grid gap-1 pb-6", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutDesktopHeading = ({ children, className, ...rest }: ElementProps<"div">) => {
  return (
    <div className={twMerge("text-4xl font-bold", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutDesktopSubheading = ({ children, className, ...rest }: ElementProps<"div">) => {
  return (
    <div className={twMerge("text-xl font-light", className)} {...rest}>
      {children}
    </div>
  );
};

export const LayoutDesktopBody = ({ children, className, ...rest }: ElementProps<"main">) => {
  return (
    <main className={twMerge("overflow-y-auto w-full tracking-normal", className)} {...rest}>
      {children}
    </main>
  );
};
