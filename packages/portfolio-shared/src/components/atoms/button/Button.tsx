import React from "react";
import { twMerge } from "tailwind-merge";

import { ElementProps } from "../../../utils/types";

export const Button = ({ children, className, ...rest }: ElementProps<"button">) => (
  <button
    className={twMerge("rounded-sm border px-2 py-1.5 hover:bg-slate-100 active:bg-slate-200", className)}
    {...rest}
  >
    {children}
  </button>
);
