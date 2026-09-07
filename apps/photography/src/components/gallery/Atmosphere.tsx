import { Sparkles } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { CORRIDOR_HALF_WIDTH, type Gallery, MAX_ROOM_DEPTH } from "../../utils/gallery";
import { useGallery } from "./state";

// Dust hanging in the light + faint shafts under the ceiling strips. Pure
// atmosphere: the first thing that makes the space feel like air rather
// than a diagram. Scaled back on "lite", frozen on reduced-motion.
export const Atmosphere = ({ gallery }: { gallery: Gallery }) => {
  const { stairs, bounds, rooms, levelHeight } = gallery;
  const quality = useGallery((s) => s.quality);
  const reducedMotion = useGallery((s) => s.reducedMotion);
  const timeOfDay = useGallery((s) => s.timeOfDay);

  const width = (CORRIDOR_HALF_WIDTH + MAX_ROOM_DEPTH + 2) * 2;
  const speed = reducedMotion ? 0 : 0.3;
  const moteColor = timeOfDay === "evening" ? "#ffd9a0" : "#fff4e2";

  const shafts = useMemo(() => {
    if (quality !== "high") return [];
    return rooms.map((room) => {
      const sign = room.side === "left" ? -1 : 1;
      const [, baseY, cz] = room.center;
      return {
        key: room.id,
        position: [sign * CORRIDOR_HALF_WIDTH, baseY + room.size.height - 0.4, cz] as const,
      };
    });
  }, [rooms, quality]);

  return (
    <group>
      <Sparkles
        count={quality === "high" ? 140 : 45}
        scale={[width, 4, Math.abs(bounds.maxZ - stairs.bottomZ)]}
        position={[0, 2.4, (bounds.maxZ + stairs.bottomZ) / 2]}
        size={2.4}
        speed={speed}
        opacity={0.5}
        color={moteColor}
        noise={1.2}
      />
      <Sparkles
        count={quality === "high" ? 120 : 40}
        scale={[width, 4, Math.abs(stairs.topZ - bounds.minZ)]}
        position={[0, levelHeight + 2.4, (stairs.topZ + bounds.minZ) / 2]}
        size={2.4}
        speed={speed}
        opacity={0.5}
        color={moteColor}
        noise={1.2}
      />
      {shafts.map((shaft) => (
        <mesh key={shaft.key} position={shaft.position} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.6, 4, 20, 1, true]} />
          <meshBasicMaterial
            color={moteColor}
            transparent
            opacity={timeOfDay === "evening" ? 0.06 : 0.035}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};
