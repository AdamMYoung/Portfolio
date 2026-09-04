/** Pure snake rules — no rendering, no React. Unit-tested in snake.test.ts. */

export type Cell = { x: number; y: number };

/** Grid is GRID x GRID cells. */
export const GRID = 19;
/** Seconds per move at score 0. */
export const STEP = 0.11;

/** One step forward. `dir` must already be validated against 180° reversal. */
export function advance(
  snake: Cell[],
  dir: Cell,
  food: Cell,
  n = GRID
): { snake: Cell[]; ate: boolean; dead: boolean } {
  const neck = snake[0];
  if (!neck) return { snake, ate: false, dead: true };
  const head = { x: neck.x + dir.x, y: neck.y + dir.y };
  const hitWall = head.x < 0 || head.y < 0 || head.x >= n || head.y >= n;
  // the tail cell is vacated this step (unless we grow), so it's not a hit
  const body = snake.slice(0, -1);
  const hitSelf = body.some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) return { snake, ate: false, dead: true };
  const ate = head.x === food.x && head.y === food.y;
  const next = [head, ...(ate ? snake : snake.slice(0, -1))];
  return { snake: next, ate, dead: false };
}

/** Reject direction changes that reverse straight back onto the neck. */
export function steer(dir: Cell, want: Cell): Cell {
  if (want.x === -dir.x && want.y === -dir.y) return dir;
  return want;
}
