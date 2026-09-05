import { useFrame, useThree } from "@react-three/fiber";
import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Image as ImageT } from "../../utils/file";
import {
  CORRIDOR_HALF_WIDTH,
  type ImageSlot,
  ROOM_DEPTH,
  ROOM_WIDTH,
  type Room,
} from "../../utils/gallery";

const MOVE_SPEED = 3.2; // units/sec
const TURN_SPEED = 2.4; // rad/sec
const INTERACT_RANGE = 2.2;
const EYE_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.35;

type Box = { minX: number; maxX: number; minZ: number; maxZ: number };

// Solid obstacles the player can't walk through: each room's back wall and
// its bench. Everything else (frames, floating people) is fine to clip —
// only the load-bearing stuff needs real collision.
const buildObstacles = (rooms: Room[]): Box[] =>
  rooms.flatMap((room) => {
    const sign = room.side === "left" ? -1 : 1;
    const backWallX = sign * (CORRIDOR_HALF_WIDTH + ROOM_DEPTH);
    return [
      {
        minX: backWallX - 0.15,
        maxX: backWallX + 0.15,
        minZ: room.center[2] - ROOM_WIDTH / 2,
        maxZ: room.center[2] + ROOM_WIDTH / 2,
      },
      {
        minX: -0.3,
        maxX: 0.3,
        minZ: room.center[2] - 0.85,
        maxZ: room.center[2] + 0.85,
      },
    ];
  });

// Push a circle of `radius` at (x, z) out of an AABB it's overlapping.
const resolveBox = (position: THREE.Vector3, box: Box, radius: number) => {
  const closestX = THREE.MathUtils.clamp(position.x, box.minX, box.maxX);
  const closestZ = THREE.MathUtils.clamp(position.z, box.minZ, box.maxZ);
  const dx = position.x - closestX;
  const dz = position.z - closestZ;
  const distSq = dx * dx + dz * dz;
  if (distSq >= radius * radius) return;

  const dist = Math.sqrt(distSq) || 0.0001;
  const overlap = radius - dist;
  position.x += (dx / dist) * overlap;
  position.z += (dz / dist) * overlap;
};

type PlayerControlsProps = {
  rooms: Room[];
  joystickRef: MutableRefObject<{ x: number; y: number }>;
  zBounds: [number, number];
  onTargetChange: (slot: ImageSlot | null) => void;
  onOpenImage: (image: ImageT) => void;
};

// Tank controls: forward/back + turn only, no mouse-look — the camera never
// needs to be "pointed", it just faces wherever the last turn left it.
export const PlayerControls = ({
  rooms,
  joystickRef,
  zBounds,
  onTargetChange,
  onOpenImage,
}: PlayerControlsProps) => {
  const { camera } = useThree();
  const keys = useRef(new Set<string>());
  const yaw = useRef(0);
  const targetRef = useRef<ImageSlot | null>(null);
  const allSlots = rooms.flatMap((room) => room.slots);
  const obstacles = useMemo(() => buildObstacles(rooms), [rooms]);

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
    const keysDown = keys.current;
    const joystick = joystickRef.current;

    let turn = joystick.x;
    let move = -joystick.y;
    if (keysDown.has("a") || keysDown.has("arrowleft")) turn -= 1;
    if (keysDown.has("d") || keysDown.has("arrowright")) turn += 1;
    if (keysDown.has("w") || keysDown.has("arrowup")) move += 1;
    if (keysDown.has("s") || keysDown.has("arrowdown")) move -= 1;

    yaw.current -= turn * TURN_SPEED * delta;
    camera.rotation.set(0, yaw.current, 0);

    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    camera.position.addScaledVector(forward, move * MOVE_SPEED * delta);

    for (const box of obstacles) {
      resolveBox(camera.position, box, PLAYER_RADIUS);
    }

    // Outer envelope as a final backstop, in case a turn+move step ever
    // jumps past the per-obstacle collision above.
    const margin = 0.6;
    const maxX = CORRIDOR_HALF_WIDTH + ROOM_DEPTH - margin;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -maxX, maxX);
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      zBounds[0] + margin,
      zBounds[1] - margin
    );
    camera.position.y = EYE_HEIGHT;

    let nearest: ImageSlot | null = null;
    let nearestDist = INTERACT_RANGE;
    for (const slot of allSlots) {
      const dx = slot.position[0] - camera.position.x;
      const dz = slot.position[2] - camera.position.z;
      const dist = Math.hypot(dx, dz);
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
