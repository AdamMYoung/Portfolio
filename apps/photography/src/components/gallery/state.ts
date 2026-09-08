import { create } from "zustand";
import type { ImageSlot } from "../../utils/gallery";

// ── Shared gallery state ────────────────────────────────────────────────
// Discrete UI state (things a re-render should react to) lives in the store.
// Per-frame values — the player's pose, an autopilot goal — are plain
// mutable singletons below so the render loop can poke them 60×/s without
// tearing React apart.

export type Quality = "high" | "lite";
export type TimeOfDay = "day" | "evening";

type GalleryStore = {
  seed: number; // 0 = "use the image count"; a reshuffle drops a random one in
  quality: Quality;
  timeOfDay: TimeOfDay;
  reducedMotion: boolean;
  helpOpen: boolean;
  introDone: boolean;
  modalOpen: boolean; // the full-screen ImageModal is up — hide in-world overlays
  target: ImageSlot | null;
  seen: Set<string>; // image paths the player has stood in front of
  hearts: Record<string, number>; // shared tally per image (server-backed)
  mine: Set<string>; // images this browser has hearted (one shared ❤️ each)

  reshuffle: () => void;
  setQuality: (q: Quality) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setReducedMotion: (v: boolean) => void;
  setHelpOpen: (v: boolean) => void;
  finishIntro: () => void;
  setModalOpen: (v: boolean) => void;
  setTarget: (s: ImageSlot | null) => void;
  addHeart: (path: string) => void;
};

const HEARTS_KEY = "pg-gallery-hearts"; // this browser's cached view of the totals
const MINE_KEY = "pg-gallery-mine"; // images this browser has hearted

const loadJSON = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — the tally is a nicety, not load-bearing */
  }
};

const initialHearts = loadJSON<Record<string, number>>(HEARTS_KEY, {});
// Older builds counted every press per browser; treat any prior heart as
// already "mine" so migrating users can't re-inflate the shared total.
const initialMine = new Set<string>([
  ...loadJSON<string[]>(MINE_KEY, []),
  ...Object.keys(initialHearts),
]);

export const useGallery = create<GalleryStore>((set, get) => ({
  seed: 0,
  quality: "high",
  timeOfDay: "day",
  reducedMotion: false,
  helpOpen: false,
  introDone: false,
  modalOpen: false,
  target: null,
  seen: new Set(),
  hearts: initialHearts,
  mine: initialMine,

  reshuffle: () => set({ seed: 1 + Math.floor(Math.random() * 1_000_000), seen: new Set() }),
  setQuality: (q) => set({ quality: q }),
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  finishIntro: () => set({ introDone: true }),
  setModalOpen: (v) => set({ modalOpen: v }),
  setTarget: (s) => {
    const prev = get().target;
    if (prev === s) return;
    if (s) {
      const seen = new Set(get().seen);
      seen.add(s.image.path);
      set({ target: s, seen });
    } else {
      set({ target: s });
    }
  },
  addHeart: (path) => {
    const { mine, hearts } = get();
    if (mine.has(path)) return; // one shared ❤️ per browser
    const nextMine = new Set(mine).add(path);
    const nextHearts = { ...hearts, [path]: (hearts[path] ?? 0) + 1 };
    save(MINE_KEY, [...nextMine]);
    save(HEARTS_KEY, nextHearts);
    set({ mine: nextMine, hearts: nextHearts });

    fetch("/api/hearts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.count === "number") {
          const merged = { ...get().hearts, [path]: d.count };
          save(HEARTS_KEY, merged);
          set({ hearts: merged });
        }
      })
      .catch(() => {
        /* offline / no store — the optimistic local bump stands */
      });
  },
}));

// Pull the shared totals once on the client; the server value wins over the
// local cache. (This module only ever loads client-side — the gallery canvas
// is a dynamic ssr:false import.)
if (typeof window !== "undefined") {
  fetch("/api/hearts")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { hearts?: Record<string, unknown> } | null) => {
      if (!d?.hearts) return;
      const server: Record<string, number> = {};
      for (const [k, v] of Object.entries(d.hearts)) server[k] = Number(v) || 0;
      const merged = { ...useGallery.getState().hearts, ...server };
      save(HEARTS_KEY, merged);
      useGallery.setState({ hearts: merged });
    })
    .catch(() => {});
}

// ── Per-frame singletons (no React re-render) ───────────────────────────

// Written by PlayerControls every frame; read by the minimap and anything
// else that needs "where is the camera".
export const playerPose = { x: 0, z: 3, yaw: 0 };

// The on-screen joystick writes here; PlayerControls reads it. Kept out of
// React because it changes on every pointer event.
export const joystickProxy = { current: { x: 0, y: 0 } };

// Set when the player clicks a frame — PlayerControls walks the camera here
// and clears it on arrival or on any manual input.
export const autopilot: { target: [number, number, number] | null } = { target: null };

// Fire a floating ❤️ at a world position (Reactions listens for this).
export const emitReaction = (position: [number, number, number]) => {
  window.dispatchEvent(new CustomEvent("pg:react", { detail: { position } }));
};
