"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost";
};

/** Beveled retro-desktop button. */
export function Button({ variant = "default", className, ...rest }: Props) {
  return (
    <button type="button" className={cn("rd-btn", `rd-btn--${variant}`, className)} {...rest} />
  );
}
