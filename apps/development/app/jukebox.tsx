"use client";

import { Button } from "@portfolio/ui";
import posthog from "posthog-js";
import { useSyncExternalStore } from "react";

/** R2 bucket (or any static host) serving the mp3s. */
const BASE = process.env.NEXT_PUBLIC_AUDIO_URL ?? "";

type Track = { title: string; artist: string; file: string };

/** `file` must match the object key you upload to R2. */
const TRACKS: Track[] = [
  { title: "Dreamscape", artist: "009 Sound System", file: "dreamscape.mp3" },
  { title: "Sandstorm", artist: "Darude", file: "sandstorm.mp3" },
  { title: "Neon Vice", artist: "White Bat Audio", file: "neon-vice.mp3" },
  { title: "Midnight Drive", artist: "White Bat Audio", file: "midnight-drive.mp3" },
  { title: "Chrome Horizon", artist: "White Bat Audio", file: "chrome-horizon.mp3" },
];

/* The audio element lives outside React on purpose: `Window` unmounts its
 * children when it closes, so anything held in component state would stop the
 * music the moment you close the window. Components subscribe to a version
 * counter and read the live element during render. */
let el: HTMLAudioElement | null = null;
let index = 0;
let version = 0;
const subs = new Set<() => void>();

function emit() {
  version += 1;
  for (const fn of subs) fn();
}

function audio() {
  if (!el) {
    el = new Audio();
    el.preload = "none";
    el.addEventListener("ended", () => select(index + 1, true));
    for (const ev of ["play", "pause", "timeupdate", "loadedmetadata", "volumechange", "error"]) {
      el.addEventListener(ev, emit);
    }
  }
  return el;
}

function select(next: number, play: boolean) {
  const i = (next + TRACKS.length) % TRACKS.length;
  const track = TRACKS[i];
  if (!track) return;
  const a = audio();
  if (i !== index || !a.src) {
    index = i;
    a.src = `${BASE}/${track.file}`;
  }
  // A rejected play() is an autoplay block or a missing file — the UI just
  // stays paused, which is the honest state.
  if (play) void a.play().catch(() => emit());
  else emit();
  if (play) posthog.capture("track_played", { title: track.title, artist: track.artist });
}

function toggle() {
  const a = audio();
  if (!a.src) return select(index, true);
  if (a.paused) void a.play().catch(() => emit());
  else a.pause();
  emit();
}

const subscribe = (fn: () => void) => {
  subs.add(fn);
  return () => subs.delete(fn);
};

const time = (s: number) =>
  Number.isFinite(s)
    ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
    : "-:--";

export function Jukebox() {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0
  );

  const a = el;
  const playing = a != null && !a.paused;
  const current = TRACKS[index];
  const duration = a?.duration ?? 0;
  const position = a?.currentTime ?? 0;

  return (
    <div className="jukebox">
      <p className="jukebox__now">
        <span className="jukebox__title">{current?.title ?? "—"}</span>
        <span className="jukebox__artist">{current?.artist}</span>
      </p>

      <div className="jukebox__transport">
        <Button onClick={() => select(index - 1, playing)} aria-label="Previous track">
          ⏮
        </Button>
        <Button variant="primary" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "⏸" : "▶"}
        </Button>
        <Button onClick={() => select(index + 1, playing)} aria-label="Next track">
          ⏭
        </Button>
      </div>

      <label className="jukebox__row">
        <span className="jukebox__time">{time(position)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={1}
          value={position}
          disabled={!duration}
          aria-label="Seek"
          onChange={(e) => {
            audio().currentTime = Number(e.target.value);
          }}
        />
        <span className="jukebox__time">{time(duration)}</span>
      </label>

      <label className="jukebox__row">
        <span className="jukebox__time" aria-hidden="true">
          VOL
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          defaultValue={1}
          aria-label="Volume"
          onChange={(e) => {
            audio().volume = Number(e.target.value);
          }}
        />
      </label>

      <ul className="jukebox__list" aria-label="Playlist">
        {TRACKS.map((t, i) => (
          <li key={t.file}>
            <button
              type="button"
              className={`jukebox__track${i === index ? " jukebox__track--on" : ""}`}
              aria-current={i === index || undefined}
              onClick={() => select(i, true)}
            >
              <span>{t.title}</span>
              <span className="jukebox__artist">{t.artist}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
