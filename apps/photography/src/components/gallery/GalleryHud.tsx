import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import { FiHelpCircle, FiMoon, FiShuffle, FiSun, FiX, FiZap } from "react-icons/fi";

import { useGallery } from "./state";

const Btn = ({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 backdrop-blur-sm transition-colors ${
      active ? "bg-white/85 text-black" : "bg-black/45 text-white hover:bg-black/65"
    }`}
  >
    {children}
  </button>
);

export const GalleryHud = () => {
  const {
    quality,
    setQuality,
    timeOfDay,
    setTimeOfDay,
    helpOpen,
    setHelpOpen,
    reshuffle,
    introDone,
    finishIntro,
    setReducedMotion,
  } = useGallery();
  const { progress, active } = useProgress();
  const [entering, setEntering] = useState(false);

  // Honour the OS "reduce motion" setting for the whole experience.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setReducedMotion]);

  // Global shortcuts: ? opens help, Esc closes overlays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?") setHelpOpen(!useGallery.getState().helpOpen);
      if (e.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setHelpOpen]);

  const ready = progress >= 100 && !active;

  return (
    <>
      {/* ── Intro / loading curtain ─────────────────────────────────── */}
      {!introDone && (
        <div
          className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0d0b0a] text-center text-[#f3efe6] transition-opacity duration-700 ${
            entering ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{ fontFamily: "var(--font-baskerville), Georgia, serif" }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Adam Young</p>
          <h1 className="mt-3 text-4xl font-normal tracking-wide sm:text-5xl">The Gallery</h1>
          <p className="mt-4 max-w-sm px-8 text-sm text-white/60">
            A walk-through of the collection. Move with your keyboard or drag to look; click a piece
            to walk to it.
          </p>
          <div className="mt-8 h-px w-48 overflow-hidden bg-white/15">
            <div
              className="h-full bg-white/70 transition-[width] duration-300"
              style={{ width: `${Math.max(6, progress)}%` }}
            />
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              setEntering(true);
              window.setTimeout(finishIntro, 700);
            }}
            className="mt-8 rounded-full border border-white/25 px-6 py-2 text-sm tracking-wide transition-colors enabled:hover:bg-white/10 disabled:opacity-40"
          >
            {ready ? "Enter" : "Loading…"}
          </button>
        </div>
      )}

      {/* ── Control cluster — sits clear of the fixed site header ────── */}
      <div className="absolute left-3 top-32 z-20 flex flex-col gap-2 sm:top-20">
        <Btn
          label={timeOfDay === "day" ? "Switch to evening" : "Switch to daylight"}
          onClick={() => setTimeOfDay(timeOfDay === "day" ? "evening" : "day")}
        >
          {timeOfDay === "day" ? <FiMoon size={16} /> : <FiSun size={16} />}
        </Btn>
        <Btn
          label={quality === "high" ? "Performance mode" : "High detail"}
          active={quality === "high"}
          onClick={() => setQuality(quality === "high" ? "lite" : "high")}
        >
          <FiZap size={16} />
        </Btn>
        <Btn label="Rebuild the gallery" onClick={reshuffle}>
          <FiShuffle size={16} />
        </Btn>
        <Btn label="Help" active={helpOpen} onClick={() => setHelpOpen(!helpOpen)}>
          <FiHelpCircle size={16} />
        </Btn>
      </div>

      {/* ── Help panel ──────────────────────────────────────────────── */}
      {helpOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="Close help"
            onClick={() => setHelpOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60"
          />
          <div
            className="relative max-w-md rounded-lg bg-[#141210] p-7 text-[#f3efe6]"
            style={{ fontFamily: "var(--font-baskerville), Georgia, serif" }}
          >
            <button
              type="button"
              aria-label="Close help"
              onClick={() => setHelpOpen(false)}
              className="absolute right-3 top-3 text-white/50 hover:text-white"
            >
              <FiX size={18} />
            </button>
            <h2 className="text-2xl">Getting around</h2>
            <dl className="mt-4 space-y-2 text-sm text-white/80">
              {[
                ["W / ↑  ·  S / ↓", "Walk forward and back"],
                ["A / ←  ·  D / →", "Turn"],
                ["Drag", "Look around"],
                ["Shift", "Move faster"],
                ["Click a piece", "Walk over to it"],
                ["E / Enter", "Inspect the piece in focus"],
                ["F", "Leave a ❤️ on it"],
                ["?", "This panel"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6">
                  <dt className="whitespace-nowrap text-white/55">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs text-white/40">
              The map, top-right, fills in the rooms as you find them. Reshuffle builds a brand-new
              floor plan from the same photographs.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
