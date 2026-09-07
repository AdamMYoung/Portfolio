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
  tour: boolean;
  quality: Quality;
  timeOfDay: TimeOfDay;
  reducedMotion: boolean;
  helpOpen: boolean;
  introDone: boolean;
  target: ImageSlot | null;
  seen: Set<string>; // image paths the player has stood in front of
  hearts: Record<string, number>;

  reshuffle: () => void;
  setTour: (v: boolean) => void;
  setQuality: (q: Quality) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setReducedMotion: (v: boolean) => void;
  setHelpOpen: (v: boolean) => void;
  finishIntro: () => void;
  setTarget: (s: ImageSlot | null) => void;
  addHeart: (path: string) => void;
};

const HEARTS_KEY = "pg-gallery-hearts";

const loadHearts = (): Record<string, number> => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(HEARTS_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const saveHearts = (hearts: Record<string, number>) => {
  try {
    window.localStorage.setItem(HEARTS_KEY, JSON.stringify(hearts));
  } catch {
    /* private mode / quota — the tally is a nicety, not load-bearing */
  }
};

export const useGallery = create<GalleryStore>((set, get) => ({
  seed: 0,
  tour: false,
  quality: "high",
  timeOfDay: "day",
  reducedMotion: false,
  helpOpen: false,
  introDone: false,
  target: null,
  seen: new Set(),
  hearts: loadHearts(),

  reshuffle: () =>
    set({ seed: 1 + Math.floor(Math.random() * 1_000_000), seen: new Set(), tour: false }),
  setTour: (v) => set({ tour: v }),
  setQuality: (q) => set({ quality: q }),
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  finishIntro: () => set({ introDone: true }),
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
    const hearts = { ...get().hearts, [path]: (get().hearts[path] ?? 0) + 1 };
    saveHearts(hearts);
    set({ hearts });
  },
}));

// ── Per-frame singletons (no React re-render) ───────────────────────────

// Written by PlayerControls / TourController every frame; read by the
// minimap and anything else that needs "where is the camera".
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
