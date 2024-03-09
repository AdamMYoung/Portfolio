"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

import { ElementProps } from "../../../utils";

export const ImageGrid = ({ children, className, ...rest }: ElementProps<"div">) => {
  return (
    <div
      className={twMerge(
        "[column-count:2] lg:[column-count:3] 2xl:[column-count:4] min-[2000px]:[column-count:5] gap-2 md:mr-2",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
