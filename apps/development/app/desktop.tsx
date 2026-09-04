"use client";

import { CrtScreen, CrtStage, MotionToggle } from "@portfolio/crt";
import { DesktopIcon, Taskbar, useWindows, Window, WindowManagerProvider } from "@portfolio/ui";
import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

const AppLoading = () => (
  <p className="pg-game__status" role="status">
    Loading…
  </p>
);

// Each easter egg is its own lazy chunk — nothing here touches the initial
// bundle (PixiJS included) until its window is opened.
const APPS: Record<string, ComponentType> = {
  snake: dynamic(() => import("@portfolio/games/snake"), { ssr: false, loading: AppLoading }),
  invaders: dynamic(() => import("@portfolio/games/space-invaders"), {
    ssr: false,
    loading: AppLoading,
  }),
  matrix: dynamic(() => import("@portfolio/games/matrix"), { ssr: false, loading: AppLoading }),
  hacker: dynamic(() => import("@portfolio/games/hacker"), { ssr: false, loading: AppLoading }),
};

export type Panel = {
  id: string;
  title: string;
  icon: string;
  /** Static content (Server Component). */
  node?: ReactNode;
  /** Lazy client app keyed into APPS. */
  app?: keyof typeof APPS;
  /** Which desktop icon column: portfolio (left) vs diversions (right). */
  side?: "left" | "right";
  width?: number;
  height?: number;
  modal?: boolean;
};

export function Desktop({ panels, defaultOpen }: { panels: Panel[]; defaultOpen?: string }) {
  const first = panels.find((p) => p.id === defaultOpen);
  return (
    <CrtStage controls={<MotionToggle />}>
      <CrtScreen label="Portfolio desktop" badge="AY//OS 1.0">
        <WindowManagerProvider
          initialOpen={first ? [{ id: first.id, title: first.title, icon: first.icon }] : []}
        >
          <DesktopInner panels={panels} />
        </WindowManagerProvider>
      </CrtScreen>
    </CrtStage>
  );
}

function IconColumn({
  panels,
  label,
  className,
  onOpen,
}: {
  panels: Panel[];
  label: string;
  className?: string;
  onOpen: (p: Panel) => void;
}) {
  return (
    <ul className={`rd-desktop__icons${className ? ` ${className}` : ""}`} aria-label={label}>
      {panels.map((p) => (
        <li key={p.id}>
          <DesktopIcon icon={p.icon} label={p.title} onOpen={() => onOpen(p)} />
        </li>
      ))}
    </ul>
  );
}

function DesktopInner({ panels }: { panels: Panel[] }) {
  const { open } = useWindows();
  const openPanel = (p: Panel) => open({ id: p.id, title: p.title, icon: p.icon });

  const left = panels.filter((p) => (p.side ?? "left") === "left");
  const right = panels.filter((p) => p.side === "right");

  return (
    <div className="rd-desktop">
      <div className="rd-desktop__surface" id="screen-content" tabIndex={-1}>
        <IconColumn panels={left} label="Portfolio" onOpen={openPanel} />
        <IconColumn
          panels={right}
          label="Diversions"
          className="rd-desktop__icons--right"
          onOpen={openPanel}
        />

        <p className="rd-desktop__prompt" aria-hidden="true">
          {"AY//OS ready"}
        </p>

        {panels.map((p) => {
          const App = p.app ? APPS[p.app] : null;
          return (
            <Window
              key={p.id}
              id={p.id}
              title={p.title}
              icon={p.icon}
              width={p.width}
              height={p.height}
              modal={p.modal}
            >
              {App ? <App /> : p.node}
            </Window>
          );
        })}
      </div>

      <Taskbar brand="AY//OS" />
    </div>
  );
}
