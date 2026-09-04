"use client";

import { useEffect, useState } from "react";

/** Ticking HH:MM clock. Renders a stable placeholder on the server to avoid a
 *  hydration mismatch, then hydrates to real time. */
export function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const t = setInterval(update, 15_000);
    return () => clearInterval(t);
  }, []);

  return (
    <time className="rd-clock" suppressHydrationWarning>
      {time ?? "--:--"}
    </time>
  );
}
