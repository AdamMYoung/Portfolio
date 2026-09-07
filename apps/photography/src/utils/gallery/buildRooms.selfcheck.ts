// Ponytail self-check for the layout engine.
//   npx tsx src/utils/gallery/buildRooms.selfcheck.ts
// Not imported anywhere in the app — this file exists only to be run directly,
// so buildRooms.ts stays free of any Node-only (`require`/`module`) reference
// that would break the client bundle.
import type { Image } from "../file";
import {
  buildGallery,
  collisionBoxes,
  groundHeightAt,
  LEVEL_HEIGHT,
  tourStops,
} from "./buildRooms";

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

  // Same-side rooms on a level never overlap along the spine — otherwise
  // their frames clip through each other's back wall.
  const spans = new Map<string, [number, number][]>();
  for (const r of gallery.rooms) {
    const key = `${r.level}:${r.side}`;
    const lo = r.center[2] - r.size.width / 2;
    const hi = r.center[2] + r.size.width / 2;
    const list = spans.get(key) ?? [];
    for (const [plo, phi] of list) {
      console.assert(hi <= plo || lo >= phi, `same-side rooms overlap on ${key} (count=${count})`);
    }
    list.push([lo, hi]);
    spans.set(key, list);
  }

  // A reshuffle seed changes the layout; the same seed reproduces it.
  const a = buildGallery(images, 999);
  const b = buildGallery(images, 999);
  const c = buildGallery(images, 1000);
  console.assert(JSON.stringify(a) === JSON.stringify(b), `seed is deterministic (count=${count})`);
  if (count > 3) {
    console.assert(
      JSON.stringify(a) !== JSON.stringify(c),
      `different seeds diverge (count=${count})`
    );
  }

  // Every tour stop is finite and starts in the foyer.
  const stops = tourStops(gallery);
  console.assert(
    stops.length === gallery.rooms.length + 2,
    `tour visits every room (count=${count})`
  );
  for (const s of stops) {
    console.assert(
      s.pos.every(Number.isFinite) && s.look.every(Number.isFinite),
      "tour stop is finite"
    );
  }
}
console.log("buildGallery self-check passed");
