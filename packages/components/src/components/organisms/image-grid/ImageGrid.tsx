"use client";

import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

import { ElementProps, createBreakpoint } from "../../../utils";

const useBreakpoint = createBreakpoint({ "3xl": 2000, "2xl": 1536, lg: 1024, md: 768 });

const breakpointColumnMap: Record<string, number> = {
  "3xl": 5,
  "2xl": 4,
  lg: 3,
  md: 2,
};

export const ImageGrid = ({ children, className, ...rest }: ElementProps<"div">) => {
  const breakpoint = useBreakpoint();

  const columns = useMemo(() => {
    const childArray = React.Children.toArray(children);
    const numberOfColumns = breakpointColumnMap[breakpoint] ?? 2;

    let currentColumnIndex = 0;

    const arrays = new Array<ReturnType<typeof React.Children.toArray>>(numberOfColumns);

    for (let i = 0; i < childArray.length; i++) {
      const currentElement = childArray[i];

      arrays[currentColumnIndex] = arrays[currentColumnIndex] ?? [];

      arrays[currentColumnIndex]!.push(currentElement);

      if (currentColumnIndex === numberOfColumns - 1) {
        currentColumnIndex = 0;
      } else {
        currentColumnIndex += 1;
      }
    }

    return arrays;
  }, [children, breakpoint]);

  return (
    <div
      className={twMerge("grid grid-cols-2 gap-x-2 lg:grid-cols-3 2xl:grid-cols-4 min-[2000px]:grid-cols-5", className)}
      {...rest}
    >
      {columns.map((column, index) => (
        <div key={index} className="flex flex-col gap-2">
          {column}
        </div>
      ))}
    </div>
  );
};
