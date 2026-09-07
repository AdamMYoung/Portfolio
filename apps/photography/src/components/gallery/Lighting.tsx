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
    // Fill carries the room now that most lamps are gone — but the walls are
    // near-white, so keep it just under a clip.
    ambient: 0.42,
    hemiIntensity: 0.9,
    key: new THREE.Color("#ffffff"),
    keyIntensity: 0.7,
    lamp: new THREE.Color("#fff4e2"),
    lampIntensity: 9,
  },
  evening: {
    hemiSky: new THREE.Color("#2a2740"),
    hemiGround: new THREE.Color("#20140e"),
    ambient: 0.2,
    hemiIntensity: 0.45,
    key: new THREE.Color("#ffd9a8"),
    keyIntensity: 0.3,
    lamp: new THREE.Color("#ffcf9a"),
    lampIntensity: 13,
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

  // Keep the point-light count low — three compiles every lit material's
  // fragment shader with a loop over ALL point lights in the scene, so the
  // total count (not just what's in range) is what costs. A couple of
  // long-throw lamps per level plus one for each big "hall" room; everything
  // else rides the hemisphere fill and the emissive track lights.
  const lamps = useMemo<Lamp[]>(() => {
    const list: Lamp[] = [];

    const runLamp = (fromZ: number, toZ: number, y: number) => {
      const n = Math.min(2, Math.max(1, Math.round(Math.abs(fromZ - toZ) / 45)));
      for (let i = 0; i < n; i++) {
        const z = fromZ + ((i + 0.5) / n) * (toZ - fromZ);
        list.push({ position: [0, y, z], distance: (Math.abs(fromZ - toZ) / n) * 1.5 });
      }
    };
    runLamp(bounds.maxZ, stairs.bottomZ, 5);
    runLamp(stairs.topZ, bounds.minZ, 9);

    for (const room of rooms) {
      if (room.variant !== "hall") continue;
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
      hemi.current.intensity = THREE.MathUtils.lerp(
        hemi.current.intensity,
        target.hemiIntensity,
        t
      );
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
      <hemisphereLight ref={hemi} args={["#fdfbf6", "#d7ccb7", 0.9]} />
      <ambientLight ref={ambient} intensity={0.42} />
      <directionalLight ref={key} position={[6, 14, 4]} intensity={0.7} />
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
