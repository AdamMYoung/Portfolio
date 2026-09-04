"use client";

export { Button } from "./components/Button";
export { Clock } from "./components/Clock";
export { DesktopIcon } from "./components/DesktopIcon";
export { Taskbar } from "./components/Taskbar";
export { Window } from "./components/Window";
export {
  useWindows,
  WindowManagerProvider,
  type WindowMeta,
  type WindowState,
} from "./components/WindowManager";
export { useFocusTrap } from "./hooks/useFocusTrap";
