import { ElementProps } from "components";
import { ReactElement } from "react";
import { twMerge } from "tailwind-merge";

type IconLinkProps = ElementProps<"a"> & {
  icon: ReactElement;
};

export const IconLink = ({ children, icon, className, ...rest }: IconLinkProps) => {
  const _className = twMerge(
    "inline-flex border border-gray-700 transition-colors items-center gap-1.5 bg-gray-800 hover:bg-gray-900 px-1  py-0.5 leading-4 rounded",
    className
  );

  return (
    <a className={_className} {...rest}>
      {icon}
      {children}
    </a>
  );
};
