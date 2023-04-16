import { useEffect, useMemo, useState } from "react";
import { isBrowser, off, on } from "./misc";

export const createBreakpoint =
  (
    breakpoints: { [name: string]: number } = {
      lg: 1024,
      md: 768,
    }
  ) =>
  () => {
    const [screen, setScreen] = useState(isBrowser ? window.innerWidth : 0);

    useEffect(() => {
      const setSideScreen = (): void => {
        setScreen(window.innerWidth);
      };
      setSideScreen();
      on(window, "resize", setSideScreen);
      return () => {
        off(window, "resize", setSideScreen);
      };
    });

    const sortedBreakpoints = useMemo(() => Object.entries(breakpoints).sort((a, b) => (a[1] >= b[1] ? 1 : -1)), []);

    const result = sortedBreakpoints.reduce((acc, [name, width]) => {
      if (screen >= width) {
        return name;
      } else {
        return acc;
      }
    }, sortedBreakpoints[0][0]);

    return result;
  };
