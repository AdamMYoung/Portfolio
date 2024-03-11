import React, { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const IconList = ({ children, className, ...rest }: ComponentProps<"div">) => {
  return (
    <div className={twMerge("flex gap-4 text-xl", className)} {...rest}>
      {children}
    </div>
  );
};
