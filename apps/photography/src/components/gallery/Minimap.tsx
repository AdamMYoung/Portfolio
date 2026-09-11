import { useEffect, useMemo, useRef } from "react";

import { CORRIDOR_HALF_WIDTH, type Gallery, MAX_ROOM_DEPTH } from "../../utils/gallery";
import { playerPose, useGallery } from "./state";

// Top-down floor plan, pinned top-right. The whole gallery footprint is
// scaled to fit a small fixed box (it used to grow with the gallery's
// length and swallow the screen). Rooms fill with their accent colour once
// you've stood in front of them, so it doubles as a "what have I missed"
// tracker. The player arrow is nudged straight on the DOM via rAF — no React
// churn at 60fps.
const PAD = 8;
const VB_W = 132;
const VB_H = 172;

export const Minimap = ({ gallery }: { gallery: Gallery }) => {
  const seen = useGallery((s) => s.seen);
  const arrow = useRef<SVGGElement>(null);

  const view = useMemo(() => {
    const spanX = (CORRIDOR_HALF_WIDTH + MAX_ROOM_DEPTH + 2) * 2;
    const spanZ = gallery.bounds.maxZ - gallery.bounds.minZ;
    const zMid = (gallery.bounds.maxZ + gallery.bounds.minZ) / 2;
    // Fit the longer axis; the map never outgrows the box.
    const scale = Math.min((VB_W - PAD * 2) / spanX, (VB_H - PAD * 2) / spanZ);
    const px = (x: number) => VB_W / 2 + x * scale;
    // Deeper into the gallery (smaller z) reads downward on the map.
    const py = (z: number) => VB_H / 2 - (z - zMid) * scale;
    return { scale, px, py };
  }, [gallery]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (arrow.current) {
        const x = Math.max(3, Math.min(VB_W - 3, view.px(playerPose.x)));
        const y = Math.max(3, Math.min(VB_H - 3, view.py(playerPose.z)));
        // Camera forward is (-sin yaw, -cos yaw) in world XZ, which maps to
        // (-sin yaw, cos yaw) on screen; the arrow art points "up", so the
        // rotation that aligns it is yaw + 180°.
        const deg = (playerPose.yaw * 180) / Math.PI + 180;
        arrow.current.setAttribute(
          "transform",
          `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [view]);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute right-2 top-[calc(4.5rem+env(safe-area-inset-top))] h-[132px] w-[102px] rounded-md bg-black/45 backdrop-blur-sm sm:right-3 sm:h-[168px] sm:w-[130px]"
      aria-hidden="true"
    >
      <title>Gallery map</title>
      {/* spine */}
      <line
        x1={view.px(0)}
        y1={view.py(gallery.bounds.maxZ)}
        x2={view.px(0)}
        y2={view.py(gallery.bounds.minZ)}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={CORRIDOR_HALF_WIDTH * 2 * view.scale}
      />
      {/* stairs */}
      <rect
        x={view.px(-gallery.stairs.width / 2)}
        y={view.py(gallery.stairs.bottomZ)}
        width={gallery.stairs.width * view.scale}
        height={Math.abs(gallery.stairs.bottomZ - gallery.stairs.topZ) * view.scale}
        fill="rgba(255,255,255,0.18)"
      />
      {gallery.rooms.map((room) => {
        const sign = room.side === "left" ? -1 : 1;
        const [, , cz] = room.center;
        const near = sign * CORRIDOR_HALF_WIDTH;
        const far = sign * (CORRIDOR_HALF_WIDTH + room.size.depth);
        const isSeen = room.slots.some((s) => seen.has(s.image.path));
        const accent = `rgb(${room.accentColor.r | 0}, ${room.accentColor.g | 0}, ${room.accentColor.b | 0})`;
        return (
          <rect
            key={room.id}
            x={view.px(Math.min(near, far))}
            y={view.py(cz + room.size.width / 2)}
            width={room.size.depth * view.scale}
            height={room.size.width * view.scale}
            fill={isSeen ? accent : "rgba(255,255,255,0.08)"}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={0.4}
          />
        );
      })}
      <g ref={arrow}>
        <polygon points="0,-3.5 2.6,3 -2.6,3" fill="#ffd9a0" stroke="#1a1a1a" strokeWidth={0.6} />
      </g>
    </svg>
  );
};
