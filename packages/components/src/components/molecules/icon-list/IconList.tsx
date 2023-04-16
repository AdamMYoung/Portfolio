import React from "react";
import { twMerge } from "tailwind-merge";

import { ElementProps } from "../../../utils";

export const IconList = ({ children, className, ...rest }: ElementProps<"div">) => {
  return (
    <div className={twMerge("flex gap-4 text-xl", className)} {...rest}>
      {children}
    </div>
  );
};
