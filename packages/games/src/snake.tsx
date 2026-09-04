"use client";

import { palette } from "@portfolio/design-tokens";
import type { Application } from "pixi.js";
import { GameShell } from "./engine/GameShell";
import { advance, type Cell, GRID as N, STEP, steer } from "./snake-logic";

/** Neon Snake. Arrow keys / WASD to steer, P to pause, Space to restart. */
export default function Snake() {
  return (
    <GameShell
      title="Neon Snake"
      instructions="Arrow keys or WASD to steer · P to pause · Space to restart"
      touchControls="dpad"
      aspect={1}
      create={createSnake}
    />
  );
}

async function createSnake(app: Application, announce: (m: string) => void) {
  const { Graphics } = await import("pixi.js");
  const g = new Graphics();
  app.stage.addChild(g);

  let snake: Cell[] = [];
  let dir: Cell = { x: 1, y: 0 };
  let pending: Cell = dir;
  let food: Cell = { x: 0, y: 0 };
  let acc = 0;
  let score = 0;
  let dead = false;
  let started = false;

  const randFood = () => {
    let c: Cell;
    do {
      c = { x: (Math.random() * N) | 0, y: (Math.random() * N) | 0 };
    } while (snake.some((s) => s.x === c.x && s.y === c.y));
    food = c;
  };

  const reset = () => {
    snake = [
      { x: 8, y: 9 },
      { x: 7, y: 9 },
      { x: 6, y: 9 },
    ];
    dir = { x: 1, y: 0 };
    pending = dir;
    acc = 0;
    score = 0;
    dead = false;
    started = false;
    randFood();
    announce("Ready — press an arrow key to start");
  };
  reset();

  const draw = () => {
    if (!app.screen || g.destroyed) return;
    const size = Math.min(app.screen.width, app.screen.height);
    const cell = size / N;
    const ox = (app.screen.width - size) / 2;
    const oy = (app.screen.height - size) / 2;
    g.clear();
    // subtle board border
    g.rect(ox, oy, size, size).stroke({ width: 2, color: palette.purple, alpha: 0.5 });
    g.rect(
      ox + food.x * cell + cell * 0.15,
      oy + food.y * cell + cell * 0.15,
      cell * 0.7,
      cell * 0.7
    ).fill(palette.magenta);
    snake.forEach((s, i) => {
      g.rect(ox + s.x * cell + 1, oy + s.y * cell + 1, cell - 2, cell - 2).fill(
        i === 0 ? palette.phosphor : palette.cyan
      );
    });
  };
  draw();

  const tick = (
    dt: number,
    input: { x: number; y: number; fire: boolean; pressed: Set<string> }
  ) => {
    if (dead) {
      if (input.fire) reset();
      return;
    }
    // steer from discrete presses (block 180° reversals)
    if (input.pressed.has("right")) pending = steer(dir, { x: 1, y: 0 });
    else if (input.pressed.has("left")) pending = steer(dir, { x: -1, y: 0 });
    else if (input.pressed.has("down")) pending = steer(dir, { x: 0, y: 1 });
    else if (input.pressed.has("up")) pending = steer(dir, { x: 0, y: -1 });

    if (!started) {
      if (input.pressed.size > 0) started = true;
      else return;
    }

    acc += dt;
    const step = Math.max(0.05, STEP - score * 0.002);
    if (acc < step) return;
    acc = 0;

    dir = pending;
    const res = advance(snake, dir, food, N);
    if (res.dead) {
      dead = true;
      announce(`Game over — score ${score}. Press Space to play again.`);
      return;
    }
    snake = res.snake;
    if (res.ate) {
      score += 1;
      announce(`Score ${score}`);
      randFood();
    }
    draw();
  };

  return {
    tick,
    destroy: () => {
      g.destroy();
    },
  };
}
