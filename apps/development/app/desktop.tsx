"use client";

import { CrtScreen, CrtStage, MotionToggle } from "@portfolio/crt";
import { DesktopIcon, Taskbar, useWindows, Window, WindowManagerProvider } from "@portfolio/ui";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const GameLoading = () => (
  <p className="pg-game__status" role="status">
    Booting renderer…
  </p>
);

// PixiJS (~350 kB) is only fetched when one of these windows opens.
const Snake = dynamic(() => import("@portfolio/games/snake"), {
  ssr: false,
  loading: GameLoading,
});
const SpaceInvaders = dynamic(() => import("@portfolio/games/space-invaders"), {
  ssr: false,
  loading: GameLoading,
});

export type Panel = {
  id: string;
  title: string;
  icon: string;
  node?: ReactNode;
  game?: "snake" | "invaders";
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

function DesktopInner({ panels }: { panels: Panel[] }) {
  const { open } = useWindows();

  return (
    <div className="rd-desktop">
      <div className="rd-desktop__surface" id="screen-content" tabIndex={-1}>
        <ul className="rd-desktop__icons" aria-label="Programs">
          {panels.map((p) => (
            <li key={p.id}>
              <DesktopIcon
                icon={p.icon}
                label={p.title}
                onOpen={() => open({ id: p.id, title: p.title, icon: p.icon })}
              />
            </li>
          ))}
        </ul>

        <p className="rd-desktop__prompt" aria-hidden="true">
          {"AY//OS ready"}
        </p>

        {panels.map((p) => (
          <Window
            key={p.id}
            id={p.id}
            title={p.title}
            icon={p.icon}
            width={p.width}
            height={p.height}
            modal={p.modal}
          >
            {p.game === "snake" ? <Snake /> : p.game === "invaders" ? <SpaceInvaders /> : p.node}
          </Window>
        ))}
      </div>

      <Taskbar brand="AY//OS" />
    </div>
  );
}
