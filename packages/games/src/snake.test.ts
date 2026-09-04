/**
 * Minimal self-check for the pure snake step. Run with:
 *   node packages/games/src/snake.test.ts
 * (no test framework — just assertions).
 */
import assert from "node:assert/strict";
import { advance, steer } from "./snake-logic.ts";

// moves head, drops tail (length preserved) when not eating
{
  const r = advance(
    [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ],
    { x: 1, y: 0 },
    { x: 0, y: 0 }
  );
  assert.equal(r.dead, false);
  assert.equal(r.ate, false);
  assert.deepEqual(r.snake[0], { x: 6, y: 5 });
  assert.equal(r.snake.length, 3);
}

// eating food grows the snake and reports ate
{
  const r = advance([{ x: 5, y: 5 }], { x: 1, y: 0 }, { x: 6, y: 5 });
  assert.equal(r.ate, true);
  assert.equal(r.snake.length, 2);
}

// wall collision is fatal
{
  const r = advance([{ x: 18, y: 0 }], { x: 1, y: 0 }, { x: 0, y: 0 }, 19);
  assert.equal(r.dead, true);
}

// moving the head onto the cell the tail is vacating is allowed
{
  const r = advance(
    [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
    ],
    { x: 0, y: 1 },
    { x: 0, y: 0 }
  );
  assert.equal(r.dead, false);
  assert.deepEqual(r.snake[0], { x: 5, y: 6 });
}

// biting your own body is fatal
{
  const r = advance(
    [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 5 },
    ],
    { x: 1, y: 0 },
    { x: 0, y: 0 }
  );
  assert.equal(r.dead, true);
}

// steer blocks a straight reversal but allows a turn
assert.deepEqual(steer({ x: 1, y: 0 }, { x: -1, y: 0 }), { x: 1, y: 0 });
assert.deepEqual(steer({ x: 1, y: 0 }, { x: 0, y: 1 }), { x: 0, y: 1 });

console.log("snake.test.ts — all assertions passed");
