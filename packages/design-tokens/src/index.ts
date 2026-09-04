/**
 * JS mirror of the palette for consumers that can't read CSS custom properties
 * at the point of use (canvas / p5 sketches, generative colour maths).
 * Keep in sync with `tokens.css` — this is deliberately a small, curated slice.
 */

export const palette = {
  void: "#05010f",
  voidSoft: "#0b0420",
  void700: "#140a33",
  screen: "#071a1a",
  phosphor: "#c8fff4",
  phosphorDim: "#6fb9b0",
  cyan: "#2de2e6",
  magenta: "#ff2e97",
  magentaSoft: "#ff5cc8",
  purple: "#7b2ff7",
  purpleSoft: "#a56bff",
  amber: "#ffce54",
  sunTop: "#ff6ac1",
  sunMid: "#ff8f6a",
  sunLow: "#ffd166",
  ink: "#16161f",
  paper: "#d7d7e6",
} as const;

export type PaletteKey = keyof typeof palette;

export const fonts = {
  mono: '"IBM Plex Mono", ui-monospace, monospace',
  display: '"VT323", "IBM Plex Mono", ui-monospace, monospace',
} as const;

export const motion = {
  easeCrt: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  fast: 120,
  med: 260,
  slow: 600,
} as const;

/** Read a live CSS custom property (browser only). Falls back to `fallback`. */
export function cssVar(name: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
