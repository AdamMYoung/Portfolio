import { type ClassValue, clsx } from "clsx";

/** Conditional class names. Components here own their styling via BEM-ish
 *  `rd-*` / `pg-*` classes rather than utility soup, so plain clsx is enough —
 *  no `tailwind-merge` in the client bundle. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
