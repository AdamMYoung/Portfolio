import { Sparkles } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { CORRIDOR_HALF_WIDTH, type Gallery, MAX_ROOM_DEPTH } from "../../utils/gallery";
import { useGallery } from "./state";

// Must match <TrackLight> rotation={[0, 0, sign * 0.5]} in Scene so the light
// shafts lean the same way the fixtures point.
const FIXTURE_TILT = 0.5;

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

  // One shaft per track light (two over each room opening at cz ± 1.6 — see
  // <TrackLight> in Scene). Each cone's apex is pinned to its fixture and it
  // leans into the room by the same tilt the fixture has, so the beam
  // follows where the lamp actually points.
  const shafts = useMemo(() => {
    if (quality !== "high") return [];
    return rooms.flatMap((room) => {
      const sign = room.side === "left" ? -1 : 1;
      const [, baseY, cz] = room.center;
      const apexY = baseY + room.size.height + 0.3; // the fixture's Y
      const height = room.size.height + 1.6;
      const rot = sign * FIXTURE_TILT;
      const half = height / 2;
      // Cone apex is local +Y; rotating the mesh by `rot` about Z moves it by
      // (-sin rot, cos rot) * half, so offset the mesh centre to compensate.
      return [-1.6, 1.6].map((dz) => ({
        key: `${room.id}:${dz}`,
        position: [
          sign * CORRIDOR_HALF_WIDTH + Math.sin(rot) * half,
          apexY - Math.cos(rot) * half,
          cz + dz,
        ] as const,
        rot,
        height,
      }));
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
        <mesh key={shaft.key} position={shaft.position} rotation={[0, 0, shaft.rot]}>
          {/* apex (+Y) at the light, flaring down along the fixture's tilt */}
          <coneGeometry args={[1.3, shaft.height, 18, 1, true]} />
          <meshBasicMaterial
            color={moteColor}
            transparent
            opacity={timeOfDay === "evening" ? 0.07 : 0.04}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};
