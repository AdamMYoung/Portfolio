/**
 * Server-safe entry. No React, no "use client" — importable from an RSC layout
 * so the blocking snippet ships in <head> without pulling client components
 * into the server bundle.
 */
export const MOTION_STORAGE_KEY = "portfolio:motion";

/** Runs before first paint: sets `data-motion` on <html> from the stored choice
 *  or the OS `prefers-reduced-motion` setting, so the animated background never
 *  flashes on for reduced-motion visitors. */
export const motionHeadScript = `(function(){try{var s=localStorage.getItem("${MOTION_STORAGE_KEY}");var m=window.matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.dataset.motion=(s==="on"||s==="off"?s:(m?"off":"on"));}catch(e){document.documentElement.dataset.motion="on";}})();`;
