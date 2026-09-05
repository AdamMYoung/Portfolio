import type { Color } from "../color";
import type { Image } from "../file";

// ── Layout constants ────────────────────────────────────────────────────
// A straight walking spine with rooms opening off alternating sides, split
// across two levels joined by a staircase. Everything downstream (Scene,
// PlayerControls, the NPC crowd) reads its geometry from the Gallery object
// this module produces — nothing re-derives raw numbers.
export const CORRIDOR_HALF_WIDTH = 3;
export const LEVEL_HEIGHT = 4;
export const EYE_HEIGHT = 1.6;
export const STAIR_RUN = 9; // Z length of the staircase
export const STAIR_STEPS = 16;
export const FRONT_WALL_OFFSET = 0.4; // enclosed rooms' front wall sits this far past the corridor edge

// Keep in step with the widest room depth below — the player's outer clamp
// uses it.
export const MAX_ROOM_DEPTH = 7;

export type Vec3 = [number, number, number];
export type RoomVariant = "alcove" | "chamber" | "hall";

export type ImageSlot = {
  image: Image;
  position: Vec3; // frame centre, world coords (includes the room's level Y)
  rotationY: number;
  width: number;
  height: number;
};

export type Room = {
  id: string;
  variant: RoomVariant;
  side: "left" | "right";
  level: 0 | 1;
  center: Vec3; // room floor centre, world coords
  size: { width: number; depth: number; height: number }; // width = span along Z, depth = along X
  enclosed: boolean;
  hasBench: boolean;
  hasPlinth: boolean;
  accentColor: Color;
  slots: ImageSlot[];
};

export type Stairs = {
  bottomZ: number; // level-0 end (less negative)
  topZ: number; // level-1 end (more negative)
  width: number;
};

export type Box = { minX: number; maxX: number; minZ: number; maxZ: number };

export type Gallery = {
  rooms: Room[];
  stairs: Stairs;
  bounds: { minZ: number; maxZ: number };
  levelHeight: number;
};

const VARIANTS: Record<
  RoomVariant,
  { width: number; depth: number; height: number; capacity: number }
> = {
  alcove: { width: 7.5, depth: 5, height: 4, capacity: 4 },
  chamber: { width: 9, depth: 7, height: 4.2, capacity: 6 },
  hall: { width: 12.5, depth: 6, height: 5.4, capacity: 8 },
};

// ── Frame row layout ────────────────────────────────────────────────────
const FRAME_HEIGHT = 1.55;
const FRAME_GAP = 0.5;
const MIN_ASPECT = 0.6;
const MAX_ASPECT = 1.9;

const mulberry32 = (seed: number) => {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const frameAspect = (image: Image): number => {
  const { width, height } = image.exif;
  if (!width || !height) return 1;
  return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, width / height));
};

// Size frames by their real aspect ratio, pack left-to-right with a fixed
// gap so they never overlap, and scale the whole row down together if it
// would overflow the available wall.
const layoutRow = (chunk: Image[], available: number): { width: number; height: number }[] => {
  const widths = chunk.map((image) => FRAME_HEIGHT * frameAspect(image));
  const total = widths.reduce((sum, w) => sum + w, 0) + FRAME_GAP * (chunk.length - 1);
  const scale = total > available ? available / total : 1;
  return widths.map((w) => ({ width: w * scale, height: FRAME_HEIGHT * scale }));
};

const average = (colors: Color[]): Color => {
  const sum = colors.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b, hue: acc.hue + c.hue }),
    { r: 0, g: 0, b: 0, hue: 0 }
  );
  const n = colors.length || 1;
  return { r: sum.r / n, g: sum.g / n, b: sum.b / n, hue: sum.hue / n };
};

const makeRoom = (
  index: number,
  chunk: Image[],
  variant: RoomVariant,
  side: "left" | "right",
  level: 0 | 1,
  z: number,
  rand: () => number
): Room => {
  const spec = VARIANTS[variant];
  const sign = side === "left" ? -1 : 1;
  const baseY = level * LEVEL_HEIGHT;
  const centerX = sign * (CORRIDOR_HALF_WIDTH + spec.depth / 2);
  const backWallX = sign * (CORRIDOR_HALF_WIDTH + spec.depth - 0.08);
  const frameY = baseY + Math.min(1.9, spec.height / 2 + 0.2);

  const sizes = layoutRow(chunk, spec.width - 1.4);
  const rowWidth = sizes.reduce((sum, s) => sum + s.width, 0) + FRAME_GAP * (chunk.length - 1);
  let cursor = -rowWidth / 2;

  const slots: ImageSlot[] = chunk.map((image, i) => {
    const { width, height } = sizes[i];
    const spread = cursor + width / 2;
    cursor += width + FRAME_GAP;
    return {
      image,
      position: [backWallX, frameY, z + spread] as Vec3,
      rotationY: side === "left" ? Math.PI / 2 : -Math.PI / 2,
      width,
      height,
    };
  });

  return {
    id: `room-${index}`,
    variant,
    side,
    level,
    center: [centerX, baseY, z] as Vec3,
    size: { width: spec.width, depth: spec.depth, height: spec.height },
    enclosed: variant === "chamber",
    hasBench: rand() < 0.62,
    hasPlinth: rand() < 0.34,
    accentColor: average(chunk.map((image) => image.color)),
    slots,
  };
};

// ── The layout engine ───────────────────────────────────────────────────
export const buildGallery = (images: Image[]): Gallery => {
  const rand = mulberry32(Math.imul(images.length + 1, 2654435761));
  const sorted = [...images].sort((a, b) => a.color.hue - b.color.hue);

  const pickVariant = (): RoomVariant => {
    const r = rand();
    if (r < 0.48) return "alcove";
    if (r < 0.8) return "chamber";
    return "hall";
  };

  const rooms: Room[] = [];
  let cursor = 0;
  let z = 0;
  let level: 0 | 1 = 0;
  let prevSide: "left" | "right" | null = null;
  let sameSideRun = 0;
  let index = 0;
  let placedThisLevel = 0;

  // Level 0 gets roughly the first half of the images.
  const half = images.length / 2;
  let stairs: Stairs | null = null;

  const nextSide = (): "left" | "right" => {
    let s: "left" | "right" = rand() < 0.5 ? "left" : "right";
    if (s === prevSide && sameSideRun >= 1) s = s === "left" ? "right" : "left";
    sameSideRun = s === prevSide ? sameSideRun + 1 : 0;
    prevSide = s;
    return s;
  };

  while (cursor < sorted.length) {
    // Drop in the staircase once level 0 has its share and at least one room.
    if (level === 0 && !stairs && cursor >= half && placedThisLevel > 0 && cursor < sorted.length) {
      const bottomZ = z - 4.5;
      const topZ = bottomZ - STAIR_RUN;
      stairs = { bottomZ, topZ, width: (CORRIDOR_HALF_WIDTH - 0.25) * 2 };
      z = topZ - 4;
      level = 1;
      placedThisLevel = 0;
      prevSide = null;
      sameSideRun = 0;
    }

    const variant = pickVariant();
    const spec = VARIANTS[variant];
    const take = Math.min(spec.capacity, sorted.length - cursor);
    const chunk = sorted.slice(cursor, cursor + take);
    cursor += take;

    const side = nextSide();
    rooms.push(makeRoom(index++, chunk, variant, side, level, z, rand));
    placedThisLevel++;

    let advance = spec.width / 2 + 4.2 + rand() * 3;

    // Occasionally pair a room directly opposite so the spine feels like a
    // crossing rather than a plain hallway.
    if (cursor < sorted.length && rand() < 0.28) {
      const v2 = pickVariant();
      const s2 = VARIANTS[v2];
      const take2 = Math.min(s2.capacity, sorted.length - cursor);
      const chunk2 = sorted.slice(cursor, cursor + take2);
      cursor += take2;
      rooms.push(makeRoom(index++, chunk2, v2, side === "left" ? "right" : "left", level, z, rand));
      placedThisLevel++;
      advance = Math.max(advance, s2.width / 2 + 4.2);
    }

    z -= advance;
  }

  // Guarantee a staircase exists even for tiny image sets so downstream
  // helpers never see null.
  if (!stairs) {
    const bottomZ = z - 4.5;
    stairs = { bottomZ, topZ: bottomZ - STAIR_RUN, width: (CORRIDOR_HALF_WIDTH - 0.25) * 2 };
  }

  return {
    rooms,
    stairs,
    bounds: { minZ: z - 6, maxZ: 3 },
    levelHeight: LEVEL_HEIGHT,
  };
};

// ── Shared helpers ──────────────────────────────────────────────────────

// Floor elevation at a given Z: flat on level 0, a linear ramp across the
// staircase, flat on level 1. The player, the NPCs and the camera all sit
// on top of this.
export const groundHeightAt = (gallery: Gallery, z: number): number => {
  const { bottomZ, topZ } = gallery.stairs;
  if (z >= bottomZ || bottomZ === topZ) return 0;
  if (z <= topZ) return gallery.levelHeight;
  return ((bottomZ - z) / (bottomZ - topZ)) * gallery.levelHeight;
};

// Axis-aligned (X/Z) blockers the player can't walk through. Levels never
// overlap in Z, so 2D boxes are enough.
export const collisionBoxes = (gallery: Gallery): Box[] => {
  const boxes: Box[] = [];
  const T = 0.15;

  for (const room of gallery.rooms) {
    const sign = room.side === "left" ? -1 : 1;
    const halfW = room.size.width / 2;
    const backWallX = sign * (CORRIDOR_HALF_WIDTH + room.size.depth);
    const [, , cz] = room.center;

    // Back wall — always present.
    boxes.push({ minX: backWallX - T, maxX: backWallX + T, minZ: cz - halfW, maxZ: cz + halfW });

    if (room.enclosed) {
      const frontX = sign * (CORRIDOR_HALF_WIDTH + FRONT_WALL_OFFSET);
      const spanMinX = Math.min(frontX, backWallX);
      const spanMaxX = Math.max(frontX, backWallX);
      // Side walls.
      for (const wz of [cz - halfW, cz + halfW]) {
        boxes.push({ minX: spanMinX, maxX: spanMaxX, minZ: wz - T, maxZ: wz + T });
      }
      // Front wall in two segments, leaving a doorway at the centre.
      const doorHalf = 1.35;
      boxes.push({ minX: frontX - T, maxX: frontX + T, minZ: cz - halfW, maxZ: cz - doorHalf });
      boxes.push({ minX: frontX - T, maxX: frontX + T, minZ: cz + doorHalf, maxZ: cz + halfW });
    }

    if (room.hasBench) {
      const bx = sign * (CORRIDOR_HALF_WIDTH - 1.1);
      boxes.push({ minX: bx - 0.4, maxX: bx + 0.4, minZ: cz - 0.95, maxZ: cz + 0.95 });
    }
  }

  // Staircase railings keep the player on the steps.
  const { topZ, bottomZ } = gallery.stairs;
  for (const sign of [-1, 1]) {
    const railX = sign * (CORRIDOR_HALF_WIDTH - 0.2);
    boxes.push({ minX: railX - 0.12, maxX: railX + 0.12, minZ: topZ, maxZ: bottomZ });
  }

  return boxes;
};

// ── Ponytail self-check: `npx tsx src/utils/gallery/buildRooms.ts` ───────
if (require.main === module) {
  const makeImage = (hue: number): Image => ({
    path: `img-${hue}`,
    exif: { width: 3000, height: 2000 } as Image["exif"],
    color: { r: 0, g: 0, b: 0, hue },
  });

  for (const count of [1, 7, 20, 53]) {
    const images = Array.from({ length: count }, (_, i) => makeImage((i * 37) % 360));
    const gallery = buildGallery(images);
    const placed = gallery.rooms.reduce((n, r) => n + r.slots.length, 0);
    console.assert(placed === count, `every image placed once (count=${count}, placed=${placed})`);
    console.assert(gallery.rooms.length > 0, `at least one room (count=${count})`);
    console.assert(gallery.bounds.minZ < gallery.bounds.maxZ, "bounds ordered");

    // Ground height is monotonic and spans exactly [0, LEVEL_HEIGHT].
    const { bottomZ, topZ } = gallery.stairs;
    console.assert(groundHeightAt(gallery, bottomZ + 1) === 0, "flat below the stairs");
    console.assert(groundHeightAt(gallery, topZ - 1) === LEVEL_HEIGHT, "flat above the stairs");
    const mid = groundHeightAt(gallery, (bottomZ + topZ) / 2);
    console.assert(mid > 0 && mid < LEVEL_HEIGHT, "ramps through the middle");

    // Every collision box is well formed.
    for (const b of collisionBoxes(gallery)) {
      console.assert(
        b.minX <= b.maxX && b.minZ <= b.maxZ && Number.isFinite(b.minX + b.maxZ),
        "collision box well formed"
      );
    }
  }
  console.log("buildGallery self-check passed");
}
