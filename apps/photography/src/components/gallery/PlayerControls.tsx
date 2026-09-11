import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  type Box,
  CORRIDOR_HALF_WIDTH,
  collisionBoxes,
  EYE_HEIGHT,
  type Gallery,
  groundHeightAt,
  type ImageSlot,
  MAX_ROOM_DEPTH,
} from "../../utils/gallery";
import {
  ARRIVE_RADIUS,
  autopilot,
  emitReaction,
  joystickProxy,
  playerPose,
  useGallery,
  VIEW_DISTANCE,
} from "./state";

const MOVE_SPEED = 3.4; // units/sec
const SPRINT = 1.8;
const TURN_SPEED = 2.5; // rad/sec
// Reach for the placard / inspect prompt. Derived, not guessed: the autopilot
// parks you VIEW_DISTANCE out and gives up ARRIVE_RADIUS short of that, so this
// has to cover the whole arrival zone or walking up to a piece leaves you just
// outside its own viewing spot.
const INTERACT_RANGE = VIEW_DISTANCE + ARRIVE_RADIUS;
const PLAYER_RADIUS = 0.35;
// Cosine of the half-cone that counts as "in front of me". Wider than the
// widest visible corner of a 68° fov, so it never drops a piece you can
// actually see — it only rules out the ones level with your shoulder, whose
// wall label is both meaningless and, as a CSS3D plane approaching 90° off
// axis, projected to a screen-wide smear on the way past.
const FACING_MIN = 0.5; // 60°
const DRAG_LOOK = 0.0042; // rad per pixel

// Push a circle at (x, z) out of any AABB it overlaps.
const resolveBox = (position: THREE.Vector3, box: Box, radius: number) => {
  const closestX = THREE.MathUtils.clamp(position.x, box.minX, box.maxX);
  const closestZ = THREE.MathUtils.clamp(position.z, box.minZ, box.maxZ);
  const dx = position.x - closestX;
  const dz = position.z - closestZ;
  const distSq = dx * dx + dz * dz;
  if (distSq >= radius * radius) return;
  const dist = Math.sqrt(distSq) || 0.0001;
  const push = radius - dist;
  position.x += (dx / dist) * push;
  position.z += (dz / dist) * push;
};

// Tank controls with quality-of-life on top: drag anywhere to look, hold
// Shift to hurry, click a frame to walk to it. Height follows the gallery's
// ground (flat, up the stairs, flat).
export const PlayerControls = ({ gallery }: { gallery: Gallery }) => {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const yaw = useRef(0);
  const targetRef = useRef<ImageSlot | null>(null);
  const drag = useRef({ active: false, moved: 0, lastX: 0 });

  const boxes = useMemo(() => collisionBoxes(gallery), [gallery]);
  const slots = useMemo(() => gallery.rooms.flatMap((room) => room.slots), [gallery]);
  const forward = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys.current.add(key);
      if (key === "e" || key === "enter") window.dispatchEvent(new CustomEvent("pg:inspect"));
      if (key === "f") {
        const t = useGallery.getState().target;
        if (t) {
          emitReaction([t.position[0], t.position[1], t.position[2]]);
          useGallery.getState().addHeart(t.image.path);
        }
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Drag-to-look on the canvas surface.
  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      drag.current = { active: true, moved: 0, lastX: e.clientX };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.lastX;
      drag.current.lastX = e.clientX;
      drag.current.moved += Math.abs(dx);
      if (drag.current.moved > 5) {
        yaw.current -= dx * DRAG_LOOK;
        autopilot.target = null;
      }
    };
    const onUp = () => {
      drag.current.active = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);

    const held = keys.current;
    const joy = joystickProxy.current;
    let turn = joy.x;
    let move = -joy.y;
    if (held.has("a") || held.has("arrowleft")) turn -= 1;
    if (held.has("d") || held.has("arrowright")) turn += 1;
    if (held.has("w") || held.has("arrowup")) move += 1;
    if (held.has("s") || held.has("arrowdown")) move -= 1;

    const manual = turn !== 0 || move !== 0;
    if (manual) autopilot.target = null;

    // Autopilot: steer toward the viewing spot in front of a clicked frame.
    if (autopilot.target && !manual) {
      const [ax, , az] = autopilot.target;
      const dx = ax - camera.position.x;
      const dz = az - camera.position.z;
      if (Math.hypot(dx, dz) < ARRIVE_RADIUS) {
        // Arrived — square up to the wall the piece hangs on.
        yaw.current = -Math.sign(ax || 1) * (Math.PI / 2);
        autopilot.target = null;
      } else {
        const want = Math.atan2(-dx, -dz);
        let d = ((want - yaw.current + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (d < -Math.PI) d += Math.PI * 2;
        yaw.current += THREE.MathUtils.clamp(d, -TURN_SPEED * step, TURN_SPEED * step);
        // Never advance while still turning toward the target — that's what
        // made a click on a piece you'd already walked up to send you away.
        const off = Math.abs(d);
        move = off > 1.2 ? 0 : off > 0.5 ? 0.35 : 1;
      }
    }

    const speed = held.has("shift") ? MOVE_SPEED * SPRINT : MOVE_SPEED;
    yaw.current -= turn * TURN_SPEED * step;
    camera.rotation.set(0, yaw.current, 0);
    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    camera.position.addScaledVector(forward, move * speed * step);

    for (const box of boxes) resolveBox(camera.position, box, PLAYER_RADIUS);

    const margin = 0.5;
    const maxX = CORRIDOR_HALF_WIDTH + MAX_ROOM_DEPTH + 0.6;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -maxX, maxX);
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      gallery.bounds.minZ + margin,
      gallery.bounds.maxZ - margin
    );
    camera.position.y = groundHeightAt(gallery, camera.position.z) + EYE_HEIGHT;

    playerPose.x = camera.position.x;
    playerPose.z = camera.position.z;
    playerPose.yaw = camera.rotation.y;

    // Nearest frame in reach — drives the placard + inspect prompt.
    let nearest: ImageSlot | null = null;
    let nearestDist = INTERACT_RANGE;
    for (const slot of slots) {
      // Floor-plan distance — "am I standing in front of it" is a question
      // about the map, and counting the frame's hanging height against the
      // budget is what put a square-on arrival out of reach.
      const dx = slot.position[0] - camera.position.x;
      const dz = slot.position[2] - camera.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist >= nearestDist) continue;
      // ...and looking at it. `forward` is this frame's heading, set above.
      if ((dx * forward.x + dz * forward.z) / (dist || 1) < FACING_MIN) continue;
      nearestDist = dist;
      nearest = slot;
    }
    if (nearest !== targetRef.current) {
      targetRef.current = nearest;
      useGallery.getState().setTarget(nearest);
    }
  });

  return null;
};
