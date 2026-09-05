"use client";

import { useGyroTilt } from "../hooks/useGyroTilt";

type Props = {
  className?: string;
};

/** Touch-only control: on iOS it requests the `deviceorientation` permission
 *  (must be a click, not fired automatically); everywhere else it just lets
 *  the visitor switch the gyro tilt off. Renders nothing on devices without
 *  orientation sensors (i.e. desktop/mouse). */
export function GyroToggle({ className }: Props) {
  const { supported, needsPermission, permission, active, requestPermission, toggle } =
    useGyroTilt();

  if (!supported) return null;

  const classes = `crt-motion-toggle${className ? ` ${className}` : ""}`;

  if (needsPermission && permission !== "granted") {
    return (
      <button type="button" onClick={requestPermission} className={classes} data-on={false}>
        <span className="crt-motion-toggle__track" aria-hidden="true">
          <span className="crt-motion-toggle__thumb" />
        </span>
        <span className="crt-motion-toggle__label">
          {permission === "denied" ? "Tilt blocked — retry" : "Enable tilt"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={toggle}
      className={classes}
      data-on={active}
    >
      <span className="crt-motion-toggle__track" aria-hidden="true">
        <span className="crt-motion-toggle__thumb" />
      </span>
      <span className="crt-motion-toggle__label">{active ? "Tilt: on" : "Tilt: off"}</span>
    </button>
  );
}
