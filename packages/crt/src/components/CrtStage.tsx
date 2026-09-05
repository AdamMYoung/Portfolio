"use client";

import { type ReactNode, useRef } from "react";
import { useGyroTilt } from "../hooks/useGyroTilt";
import { useMotionPreference } from "../hooks/useMotionPreference";
import { useParallaxPan } from "../hooks/useParallaxPan";
import { GyroToggle } from "./GyroToggle";
import { SynthwaveBackground } from "./SynthwaveBackground";

type Props = {
  children: ReactNode;
  /** Extra controls rendered in the top-right corner (e.g. <MotionToggle/>). */
  controls?: ReactNode;
};

/** Full-viewport scene: synthwave backdrop + a pointer-reactive 3D space that
 *  the CRT monitor (passed as `children`) tilts within. */
export function CrtStage({ children, controls }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPreference();
  const { active: gyroActive } = useGyroTilt();

  useParallaxPan(stageRef, { disabled: reduced, gyroActive });

  return (
    <div ref={stageRef} className="crt-stage">
      <SynthwaveBackground />
      <div className="crt-stage__controls">
        {controls}
        <GyroToggle />
      </div>
      {children}
    </div>
  );
}
