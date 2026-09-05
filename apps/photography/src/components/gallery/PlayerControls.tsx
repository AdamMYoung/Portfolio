import { useFrame, useThree } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Image as ImageT } from "../../utils/file";
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

const MOVE_SPEED = 3.4; // units/sec
const TURN_SPEED = 2.5; // rad/sec
const INTERACT_RANGE = 2.4;
const PLAYER_RADIUS = 0.35;

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

type PlayerControlsProps = {
  gallery: Gallery;
  joystickRef: MutableRefObject<{ x: number; y: number }>;
  onTargetChange: (slot: ImageSlot | null) => void;
  onOpenImage: (image: ImageT) => void;
};

// Tank controls: forward/back + turn only, no mouse-look — the camera never
// needs "pointing", it just faces wherever the last turn left it. Height
// follows the gallery's ground (flat, then up the stairs, then flat again).
export const PlayerControls = ({
  gallery,
  joystickRef,
  onTargetChange,
  onOpenImage,
}: PlayerControlsProps) => {
  const { camera } = useThree();
  const keys = useRef(new Set<string>());
  const yaw = useRef(0);
  const targetRef = useRef<ImageSlot | null>(null);

  const boxes = useMemo(() => collisionBoxes(gallery), [gallery]);
  const slots = useMemo(() => gallery.rooms.flatMap((room) => room.slots), [gallery]);
  const forward = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys.current.add(key);
      if ((key === "e" || key === "enter") && targetRef.current) {
        onOpenImage(targetRef.current.image);
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onOpenImage]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const held = keys.current;
    const joy = joystickRef.current;

    let turn = joy.x;
    let move = -joy.y;
    if (held.has("a") || held.has("arrowleft")) turn -= 1;
    if (held.has("d") || held.has("arrowright")) turn += 1;
    if (held.has("w") || held.has("arrowup")) move += 1;
    if (held.has("s") || held.has("arrowdown")) move -= 1;

    yaw.current -= turn * TURN_SPEED * step;
    camera.rotation.set(0, yaw.current, 0);

    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    camera.position.addScaledVector(forward, move * MOVE_SPEED * step);

    for (const box of boxes) resolveBox(camera.position, box, PLAYER_RADIUS);

    // Outer envelope backstop — the wall boxes do the real stopping; this
    // just guarantees the player can never end up outside the building.
    const margin = 0.5;
    const maxX = CORRIDOR_HALF_WIDTH + MAX_ROOM_DEPTH + 0.6;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -maxX, maxX);
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      gallery.bounds.minZ + margin,
      gallery.bounds.maxZ - margin
    );
    camera.position.y = groundHeightAt(gallery, camera.position.z) + EYE_HEIGHT;

    // Nearest frame in reach — drives the "view" prompt.
    let nearest: ImageSlot | null = null;
    let nearestDist = INTERACT_RANGE;
    for (const slot of slots) {
      const dx = slot.position[0] - camera.position.x;
      const dy = slot.position[1] - camera.position.y;
      const dz = slot.position[2] - camera.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = slot;
      }
    }
    if (nearest !== targetRef.current) {
      targetRef.current = nearest;
      onTargetChange(nearest);
    }
  });

  return null;
};
