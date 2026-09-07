import { useEffect, useMemo, useRef } from "react";

import { CORRIDOR_HALF_WIDTH, type Gallery, MAX_ROOM_DEPTH } from "../../utils/gallery";
import { playerPose, useGallery } from "./state";

// Top-down floor plan, pinned top-right. Rooms fill with their accent colour
// once you've stood in front of them, so it doubles as a "what have I
// missed" tracker. The player arrow is updated straight on the DOM node via
// rAF — no React churn at 60fps.
const PAD = 8;
const W = 150;

export const Minimap = ({ gallery }: { gallery: Gallery }) => {
  const seen = useGallery((s) => s.seen);
  const arrow = useRef<SVGGElement>(null);

  const view = useMemo(() => {
    const spanX = (CORRIDOR_HALF_WIDTH + MAX_ROOM_DEPTH + 2) * 2;
    const spanZ = gallery.bounds.maxZ - gallery.bounds.minZ;
    const scale = (W - PAD * 2) / spanX;
    const h = spanZ * scale + PAD * 2;
    // world (x,z) -> svg (px,py); z grows "up the page" as you walk in
    const px = (x: number) => W / 2 + x * scale;
    const py = (z: number) => PAD + (gallery.bounds.maxZ - z) * scale;
    return { scale, h, px, py };
  }, [gallery]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (arrow.current) {
        arrow.current.setAttribute(
          "transform",
          `translate(${view.px(playerPose.x).toFixed(1)} ${view.py(playerPose.z).toFixed(1)}) rotate(${(
            (-playerPose.yaw * 180) / Math.PI
          ).toFixed(1)})`
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [view]);

  return (
    <svg
      width={W}
      height={view.h}
      viewBox={`0 0 ${W} ${view.h}`}
      className="absolute right-3 top-16 rounded-md bg-black/45 backdrop-blur-sm"
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
            strokeWidth={0.5}
          />
        );
      })}
      <g ref={arrow}>
        <polygon points="0,-4 3,4 -3,4" fill="#ffd9a0" stroke="#1a1a1a" strokeWidth={0.5} />
      </g>
    </svg>
  );
};
