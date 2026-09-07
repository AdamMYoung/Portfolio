import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { Gallery } from "../../utils/gallery";
import { useGallery } from "./state";

// Two moods, cross-faded. "day" is the airy white-cube look the gallery
// shipped with; "evening" drops the fill, warms the key and lets the
// track-lights and bloom carry the room.
const MOODS = {
  day: {
    hemiSky: new THREE.Color("#fdfbf6"),
    hemiGround: new THREE.Color("#d7ccb7"),
    ambient: 0.5,
    key: new THREE.Color("#ffffff"),
    keyIntensity: 0.85,
    lamp: new THREE.Color("#fff4e2"),
    lampIntensity: 7,
  },
  evening: {
    hemiSky: new THREE.Color("#2a2740"),
    hemiGround: new THREE.Color("#20140e"),
    ambient: 0.16,
    key: new THREE.Color("#ffd9a8"),
    keyIntensity: 0.3,
    lamp: new THREE.Color("#ffcf9a"),
    lampIntensity: 10,
  },
};

type Lamp = { position: [number, number, number]; distance: number };

export const Lighting = ({ gallery }: { gallery: Gallery }) => {
  const { rooms, stairs, bounds } = gallery;
  const timeOfDay = useGallery((s) => s.timeOfDay);
  const reducedMotion = useGallery((s) => s.reducedMotion);
  const target = MOODS[timeOfDay];

  const hemi = useRef<THREE.HemisphereLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const lampGroup = useRef<THREE.Group>(null);

  const lamps = useMemo<Lamp[]>(() => {
    const l0Mid = (bounds.maxZ + stairs.bottomZ) / 2;
    const l1Mid = (stairs.topZ + bounds.minZ) / 2;
    const list: Lamp[] = [
      { position: [0, 5, l0Mid], distance: Math.abs(bounds.maxZ - stairs.bottomZ) * 0.9 },
      { position: [0, 9, l1Mid], distance: Math.abs(stairs.topZ - bounds.minZ) * 0.9 },
    ];
    for (const room of rooms) {
      const sign = room.side === "left" ? -1 : 1;
      const [, baseY, cz] = room.center;
      list.push({
        position: [sign * (room.size.depth * 0.4), baseY + room.size.height - 0.6, cz],
        distance: room.size.width,
      });
    }
    return list;
  }, [rooms, stairs, bounds]);

  useFrame((_, delta) => {
    const t = 1 - Math.exp(-3 * Math.min(delta, 0.1));
    if (hemi.current) {
      hemi.current.color.lerp(target.hemiSky, t);
      hemi.current.groundColor.lerp(target.hemiGround, t);
    }
    if (ambient.current)
      ambient.current.intensity = THREE.MathUtils.lerp(
        ambient.current.intensity,
        target.ambient,
        t
      );
    if (key.current) {
      key.current.color.lerp(target.key, t);
      key.current.intensity = THREE.MathUtils.lerp(key.current.intensity, target.keyIntensity, t);
    }
    if (lampGroup.current) {
      // A hair of flicker on the warm lamps at night; dead still by day or
      // when the visitor has asked for reduced motion.
      const flicker =
        timeOfDay === "evening" && !reducedMotion
          ? 1 +
            Math.sin(performance.now() * 0.02) * 0.03 +
            Math.sin(performance.now() * 0.011) * 0.02
          : 1;
      for (const child of lampGroup.current.children) {
        const light = child as THREE.PointLight;
        light.color.lerp(target.lamp, t);
        const base = (light.userData.baseIntensity as number) ?? target.lampIntensity;
        light.userData.baseIntensity = THREE.MathUtils.lerp(base, target.lampIntensity, t);
        light.intensity = (light.userData.baseIntensity as number) * flicker;
      }
    }
  });

  return (
    <group>
      <hemisphereLight ref={hemi} args={["#fdfbf6", "#d7ccb7", 1]} />
      <ambientLight ref={ambient} intensity={0.5} />
      <directionalLight ref={key} position={[6, 14, 4]} intensity={0.85} />
      <group ref={lampGroup}>
        {lamps.map((lamp, i) => (
          <pointLight
            key={i}
            position={lamp.position}
            intensity={7}
            distance={lamp.distance}
            decay={2}
            color="#fff4e2"
          />
        ))}
      </group>
    </group>
  );
};
