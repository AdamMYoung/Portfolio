import { useEffect, useMemo, useState } from "react";

export type Theme = "dark" | "light";

const isDarkModeSet =
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

export const useToggleTheme = () => {
  const [theme, setTheme] = useState<Theme>(isDarkModeSet ? "dark" : "light");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return [theme, setTheme] as const;
};
