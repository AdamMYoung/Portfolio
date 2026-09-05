import { type MutableRefObject, useEffect, useRef, useState } from "react";

const RADIUS = 50;

type JoystickProps = {
  valueRef: MutableRefObject<{ x: number; y: number }>;
};

// Small custom drag-stick — a single draggable knob doesn't need a whole
// library. Only shown on touch/coarse-pointer devices; desktop uses WASD.
export const Joystick = ({ valueRef }: JoystickProps) => {
  const [visible, setVisible] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activePointer = useRef<number | null>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (!visible) return null;

  const updateFromPoint = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const dxRaw = clientX - (rect.left + rect.width / 2);
    const dyRaw = clientY - (rect.top + rect.height / 2);
    const dist = Math.min(Math.hypot(dxRaw, dyRaw), RADIUS);
    const angle = Math.atan2(dyRaw, dxRaw);
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    setKnob({ x, y });
    valueRef.current = { x: x / RADIUS, y: y / RADIUS };
  };

  const reset = () => {
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    valueRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={baseRef}
      className="absolute bottom-10 left-10 h-32 w-32 touch-none select-none rounded-full bg-white/25"
      onPointerDown={(e) => {
        activePointer.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updateFromPoint(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (activePointer.current === e.pointerId) updateFromPoint(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70"
        style={{ left: `calc(50% + ${knob.x}px)`, top: `calc(50% + ${knob.y}px)` }}
      />
    </div>
  );
};
