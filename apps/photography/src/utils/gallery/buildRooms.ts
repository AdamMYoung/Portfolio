import type { Color } from "../color";
import type { Image } from "../file";

// Layout constants — a straight corridor with alcoves opening off alternating
// sides. Tuned to fit low-poly frames + a bit of walking room; change these
// and the whole gallery reflows, nothing else references raw numbers.
export const ROOM_CAPACITY = 6;
export const CORRIDOR_SPACING = 8;
export const CORRIDOR_HALF_WIDTH = 3;
export const ROOM_DEPTH = 6;
export const ROOM_WIDTH = 8;
export const ROOM_HEIGHT = 4;

export type Vec3 = [number, number, number];

export type ImageSlot = {
  image: Image;
  position: Vec3;
  rotationY: number;
  width: number;
  height: number;
};

export type Room = {
  id: string;
  side: "left" | "right";
  center: Vec3;
  accentColor: Color;
  slots: ImageSlot[];
};

// Layout budget for a room's back wall — frames are spaced by their real
// aspect ratio (clamped so one panorama or portrait can't dominate) rather
// than fixed evenly-sized slots, then the whole row is scaled down together
// if it would otherwise overflow the wall.
const FRAME_HEIGHT = 1.6;
const FRAME_GAP = 0.4;
const MIN_ASPECT = 0.6;
const MAX_ASPECT = 1.8;
const AVAILABLE_WIDTH = ROOM_WIDTH - 1;

const frameAspect = (image: Image): number => {
  const { width, height } = image.exif;
  if (!width || !height) return 1;
  return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, width / height));
};

const layoutRow = (chunk: Image[]): { width: number; height: number }[] => {
  const naturalWidths = chunk.map((image) => FRAME_HEIGHT * frameAspect(image));
  const naturalTotal =
    naturalWidths.reduce((sum, w) => sum + w, 0) + FRAME_GAP * (chunk.length - 1);
  const scale = naturalTotal > AVAILABLE_WIDTH ? AVAILABLE_WIDTH / naturalTotal : 1;

  return naturalWidths.map((width) => ({ width: width * scale, height: FRAME_HEIGHT * scale }));
};

const average = (colors: Color[]): Color => {
  const sum = colors.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b, hue: acc.hue + c.hue }),
    { r: 0, g: 0, b: 0, hue: 0 }
  );
  const n = colors.length || 1;
  return { r: sum.r / n, g: sum.g / n, b: sum.b / n, hue: sum.hue / n };
};

// Sort by hue and chunk into fixed-size groups: images with similar dominant
// colors land in the same room without any clustering algorithm, and the
// gallery scales automatically as images are added/removed from the bucket.
export const buildRooms = (images: Image[]): Room[] => {
  const sorted = [...images].sort((a, b) => a.color.hue - b.color.hue);
  const chunks: Image[][] = [];

  for (let i = 0; i < sorted.length; i += ROOM_CAPACITY) {
    chunks.push(sorted.slice(i, i + ROOM_CAPACITY));
  }

  return chunks.map((chunk, index) => {
    const side: Room["side"] = index % 2 === 0 ? "left" : "right";
    const sign = side === "left" ? -1 : 1;
    const z = -index * CORRIDOR_SPACING;
    const roomCenterX = sign * (CORRIDOR_HALF_WIDTH + ROOM_DEPTH / 2);
    const backWallX = sign * (CORRIDOR_HALF_WIDTH + ROOM_DEPTH - 0.1);

    // Images hang on the room's back wall, sized by their own aspect ratio
    // and packed left-to-right with a fixed gap so frames never overlap,
    // then centered as a group.
    const sizes = layoutRow(chunk);
    const rowWidth = sizes.reduce((sum, s) => sum + s.width, 0) + FRAME_GAP * (chunk.length - 1);
    let cursor = -rowWidth / 2;
    const slots: ImageSlot[] = chunk.map((image, slotIndex) => {
      const { width, height } = sizes[slotIndex];
      const spread = cursor + width / 2;
      cursor += width + FRAME_GAP;
      return {
        image,
        position: [backWallX, 1.8, z + spread],
        rotationY: side === "left" ? Math.PI / 2 : -Math.PI / 2,
        width,
        height,
      };
    });

    return {
      id: `room-${index}`,
      side,
      center: [roomCenterX, 0, z] as Vec3,
      accentColor: average(chunk.map((image) => image.color)),
      slots,
    };
  });
};

export const corridorLength = (rooms: Room[]): number =>
  rooms.length === 0 ? CORRIDOR_SPACING : rooms.length * CORRIDOR_SPACING;

// Ponytail self-check: `npx tsx src/utils/gallery/buildRooms.ts`
if (require.main === module) {
  const makeImage = (hue: number): Image => ({
    path: `img-${hue}`,
    exif: {} as Image["exif"],
    color: { r: 0, g: 0, b: 0, hue },
  });

  const images = Array.from({ length: 20 }, (_, i) => makeImage((i * 37) % 360));
  const rooms = buildRooms(images);

  console.assert(
    rooms.length === Math.ceil(20 / ROOM_CAPACITY),
    "room count should scale with image count"
  );
  console.assert(
    rooms.reduce((n, r) => n + r.slots.length, 0) === 20,
    "every image should appear exactly once"
  );
  console.assert(buildRooms([]).length === 0, "no images should produce no rooms");
  console.log("buildRooms self-check passed");
}
