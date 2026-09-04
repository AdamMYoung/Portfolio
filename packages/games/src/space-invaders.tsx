"use client";

import { palette } from "@portfolio/design-tokens";
import type { Application } from "pixi.js";
import { GameShell } from "./engine/GameShell";

const COLS = 8;
const ROWS = 4;

/** Vector Invaders. Arrow keys / A-D to move, Space to fire, P to pause. */
export default function SpaceInvaders() {
  return (
    <GameShell
      title="Vector Invaders"
      instructions="Arrow keys to move · Space to fire · P to pause"
      touchControls="horizontal"
      aspect={1.35}
      create={createInvaders}
    />
  );
}

type Box = { x: number; y: number; w: number; h: number; alive?: boolean };
const hit = (a: Box, b: Box) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

async function createInvaders(app: Application, announce: (m: string) => void) {
  const { Graphics } = await import("pixi.js");
  const g = new Graphics();
  app.stage.addChild(g);

  const W = () => app.screen.width;
  const H = () => app.screen.height;

  let player: Box;
  let invaders: Box[] = [];
  let pBullets: Box[] = [];
  let eBullets: Box[] = [];
  let marchDir = 1;
  let marchSpeed = 22;
  let fireCooldown = 0;
  let enemyFireTimer = 0;
  let score = 0;
  let over = false;
  let won = false;

  const reset = () => {
    const uw = W() / 14;
    player = { x: W() / 2 - uw / 2, y: H() - uw * 1.4, w: uw, h: uw * 0.7 };
    invaders = [];
    const gap = W() / (COLS + 2);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        invaders.push({
          x: gap * (c + 1),
          y: gap * 0.7 * (r + 1) + 12,
          w: gap * 0.6,
          h: gap * 0.45,
          alive: true,
        });
      }
    }
    pBullets = [];
    eBullets = [];
    marchDir = 1;
    marchSpeed = 22;
    score = 0;
    over = false;
    won = false;
    announce("Ready — move to begin");
  };
  reset();

  const draw = () => {
    if (!app.screen || g.destroyed) return;
    g.clear();
    g.rect(player.x, player.y, player.w, player.h).fill(palette.phosphor);
    g.rect(player.x + player.w / 2 - 2, player.y - 6, 4, 6).fill(palette.phosphor);
    for (const inv of invaders) {
      if (inv.alive) g.rect(inv.x, inv.y, inv.w, inv.h).fill(palette.cyan);
    }
    for (const b of pBullets) g.rect(b.x, b.y, b.w, b.h).fill(palette.amber);
    for (const b of eBullets) g.rect(b.x, b.y, b.w, b.h).fill(palette.magenta);
  };
  draw();

  const tick = (dt: number, input: { x: number; fire: boolean }) => {
    if (over || won) {
      if (input.fire) reset();
      return;
    }

    // player
    player.x = Math.max(0, Math.min(W() - player.w, player.x + input.x * 260 * dt));
    fireCooldown -= dt;
    if (input.fire && fireCooldown <= 0) {
      pBullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 8, w: 4, h: 10 });
      fireCooldown = 0.35;
    }

    // bullets
    for (const b of pBullets) b.y -= 420 * dt;
    for (const b of eBullets) b.y += 240 * dt;
    pBullets = pBullets.filter((b) => b.y > -20);
    eBullets = eBullets.filter((b) => b.y < H() + 20);

    // march
    const live = invaders.filter((i) => i.alive);
    let flip = false;
    for (const inv of live) {
      inv.x += marchDir * marchSpeed * dt;
      if (inv.x < 0 || inv.x + inv.w > W()) flip = true;
    }
    if (flip) {
      marchDir *= -1;
      marchSpeed += 4;
      for (const inv of live) inv.y += 14;
    }

    // enemy fire
    enemyFireTimer -= dt;
    if (enemyFireTimer <= 0 && live.length) {
      const shooter = live[(Math.random() * live.length) | 0];
      if (shooter) {
        eBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 10 });
        enemyFireTimer = 0.6 + Math.random() * 0.9;
      }
    }

    // collisions
    for (const b of pBullets) {
      for (const inv of live) {
        if (inv.alive && hit(b, inv)) {
          inv.alive = false;
          b.y = -999;
          score += 10;
          announce(`Score ${score}`);
        }
      }
    }
    pBullets = pBullets.filter((b) => b.y > -20);

    if (eBullets.some((b) => hit(b, player))) {
      over = true;
      announce(`Hit! Game over — score ${score}. Press Space to retry.`);
      return;
    }
    if (live.some((inv) => inv.y + inv.h >= player.y)) {
      over = true;
      announce(`Invaders landed — score ${score}. Press Space to retry.`);
      return;
    }
    if (live.length === 0) {
      won = true;
      announce(`Cleared! Final score ${score}. Press Space to play again.`);
      return;
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
