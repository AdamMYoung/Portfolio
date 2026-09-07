import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { EYE_HEIGHT, type Gallery, groundHeightAt, tourStops } from "../../utils/gallery";
import { autopilot, playerPose, useGallery } from "./state";

// A hands-off cinematic walkthrough. Lofts a smooth curve through the tour
// stops, glides the camera along it, and eases to a near-stop in front of
// each piece while the look-at settles on the work. Height is snapped to
// the real floor every frame, so it flows up the staircase for free.
const CRUISE = 1.9; // units/sec between pieces
const DWELL = 3.2; // seconds paused at each piece

export const TourController = ({ gallery }: { gallery: Gallery }) => {
  const camera = useThree((s) => s.camera);
  const active = useGallery((s) => s.tour);

  const stops = useMemo(() => tourStops(gallery), [gallery]);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        stops.map((s) => new THREE.Vector3(s.pos[0], 0, s.pos[2])),
        false,
        "catmullrom",
        0.4
      ),
    [stops]
  );
  const length = useMemo(() => curve.getLength(), [curve]);

  const run = useRef({ dist: 0, dwell: 0, stop: 0, look: new THREE.Vector3(), started: false });
  const scratch = useMemo(() => new THREE.Vector3(), []);

  // Entering the tour: pick up from wherever the camera is standing.
  useEffect(() => {
    if (!active) {
      run.current.started = false;
      return;
    }
    autopilot.target = null;
    let best = 0;
    let bestD = Infinity;
    const p = new THREE.Vector3();
    for (let i = 0; i <= 200; i++) {
      curve.getPointAt(i / 200, p);
      const d = (p.x - camera.position.x) ** 2 + (p.z - camera.position.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i / 200;
      }
    }
    run.current.dist = best * length;
    run.current.dwell = 0;
    run.current.stop = 0;
    run.current.look.set(stops[0].look[0], stops[0].look[1], stops[0].look[2]);
    run.current.started = true;
  }, [active, curve, length, camera, stops]);

  useFrame((_, delta) => {
    if (!active || !run.current.started) return;
    const dt = Math.min(delta, 0.05);
    const r = run.current;
    const n = stops.length;

    const u = THREE.MathUtils.clamp(r.dist / length, 0, 1);
    const nextStopU = Math.min(r.stop, n - 1) / (n - 1);

    // Close to the pending stop? Bleed off speed and hold for DWELL.
    const near = Math.abs(u - nextStopU) < 0.5 / (n - 1) || u > nextStopU;
    if (near && r.stop < n) {
      r.dwell += dt;
      const s = stops[Math.min(r.stop, n - 1)];
      if (s.dwell) {
        scratch.set(s.look[0], s.look[1], s.look[2]);
        r.look.lerp(scratch, 1 - Math.exp(-4 * dt));
      }
      if (r.dwell > (s.dwell ? DWELL : 0.4)) {
        r.dwell = 0;
        r.stop += 1;
      }
    } else {
      r.dist += CRUISE * dt;
    }

    if (r.stop >= n && u >= 1) {
      useGallery.getState().setTour(false);
      return;
    }

    const pos = curve.getPointAt(u);
    pos.y = groundHeightAt(gallery, pos.z) + EYE_HEIGHT;
    camera.position.lerp(pos, 1 - Math.exp(-6 * dt));

    // Between stops, look a little way down the path.
    if (!near) {
      const ahead = curve.getPointAt(Math.min(u + 0.03, 1));
      ahead.y = groundHeightAt(gallery, ahead.z) + EYE_HEIGHT;
      r.look.lerp(ahead, 1 - Math.exp(-3 * dt));
    }
    camera.lookAt(r.look);

    playerPose.x = camera.position.x;
    playerPose.z = camera.position.z;
    playerPose.yaw = camera.rotation.y;
  });

  return null;
};
