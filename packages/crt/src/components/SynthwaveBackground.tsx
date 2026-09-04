import type { HTMLAttributes } from "react";

/** Pure-CSS synthwave backdrop: starfield, retro sun, scrolling floor + ceiling
 *  grid. Decorative only — hidden from assistive tech. Animation is gated in CSS. */
export function SynthwaveBackground(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div className={`sw-bg${className ? ` ${className}` : ""}`} aria-hidden="true" {...rest}>
      <div className="sw-bg__stars" />
      <div className="sw-bg__glow" />
      <div className="sw-bg__sun" />
      <div className="sw-bg__grid sw-bg__grid--ceiling" />
      <div className="sw-bg__grid" />
      <div className="sw-bg__horizon" />
    </div>
  );
}
