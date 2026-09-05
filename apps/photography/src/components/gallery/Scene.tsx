import { useTexture } from "@react-three/drei";
import { Component, type ReactNode, Suspense } from "react";
import * as THREE from "three";

import {
  CORRIDOR_HALF_WIDTH,
  CORRIDOR_SPACING,
  corridorLength,
  type ImageSlot,
  ROOM_DEPTH,
  ROOM_HEIGHT,
  ROOM_WIDTH,
  type Room,
} from "../../utils/gallery";
import { mulberry32 } from "./random";

const WALL_COLOR = "#faf8f2";
const CEILING_COLOR = "#ffffff";
const FLOOR_COLOR = "#b08c66";

type SceneProps = { rooms: Room[] };

export const Scene = ({ rooms }: SceneProps) => {
  const length = corridorLength(rooms);
  const span = length + CORRIDOR_SPACING;
  const width = (CORRIDOR_HALF_WIDTH + ROOM_DEPTH) * 2;
  const centerZ = -length / 2 + CORRIDOR_SPACING / 2;
  const peopleCount = Math.max(4, Math.round(rooms.length * 1.5));

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[width, span]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, centerZ]}>
        <planeGeometry args={[width, span]} />
        <meshStandardMaterial color={CEILING_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {rooms.map((room) => (
        <RoomAlcove key={room.id} room={room} />
      ))}

      {Array.from({ length: peopleCount }, (_, i) => {
        const rand = mulberry32(i * 977 + 11);
        return <FloatingPerson key={i} rand={rand} spread={width} length={span} />;
      })}
    </group>
  );
};

const RoomAlcove = ({ room }: { room: Room }) => {
  const sign = room.side === "left" ? -1 : 1;
  const backWallX = sign * (CORRIDOR_HALF_WIDTH + ROOM_DEPTH);
  const runnerX = sign * (CORRIDOR_HALF_WIDTH + ROOM_DEPTH / 2);
  const accent = `rgb(${room.accentColor.r}, ${room.accentColor.g}, ${room.accentColor.b})`;

  return (
    <group>
      <mesh position={[backWallX, ROOM_HEIGHT / 2, room.center[2]]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[runnerX, 0.01, room.center[2]]}>
        <planeGeometry args={[ROOM_DEPTH - 1, ROOM_WIDTH - 1]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      <Bench position={[0, 0, room.center[2]]} rotationY={sign > 0 ? -Math.PI / 2 : Math.PI / 2} />

      <Suspense fallback={null}>
        {room.slots.map((slot) => (
          <ImageFrameBoundary key={slot.image.path}>
            <ImageFrame slot={slot} />
          </ImageFrameBoundary>
        ))}
      </Suspense>
    </group>
  );
};

// A texture load failure throws during render, past Suspense (which only
// catches pending promises, not errors) — without this, one broken image
// would unmount the entire gallery. Scoped per-frame so it just drops that
// one frame instead.
class ImageFrameBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Gallery frame failed to load", error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

// The R2 bucket doesn't send CORS headers, so THREE's TextureLoader (which
// needs cross-origin pixel access, unlike a plain <img>) fails to load the
// image directly — Next's own image optimizer re-serves it same-origin
// (and conveniently downsized, since a 3D frame never needs the full-res
// original), sidestepping CORS entirely.
const textureUrl = (path: string, width: number) =>
  `/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=75`;

const ImageFrame = ({ slot }: { slot: ImageSlot }) => {
  const texture = useTexture(textureUrl(slot.image.path, 1080));
  const { width, height } = slot;

  return (
    <group position={slot.position} rotation={[0, slot.rotationY, 0]}>
      <mesh>
        <boxGeometry args={[width + 0.15, height + 0.15, 0.08]} />
        <meshStandardMaterial color="#141414" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Bench = ({
  position,
  rotationY,
}: {
  position: [number, number, number];
  rotationY: number;
}) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[1.6, 0.1, 0.5]} />
      <meshStandardMaterial color="#3d2b1f" />
    </mesh>
    {[-0.6, 0.6].map((x) => (
      <mesh key={x} position={[x, 0.22, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.4]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    ))}
  </group>
);

// Low-poly, static (no walk cycle) — just placed around the corridor to make
// it feel occupied, per the brief.
const FloatingPerson = ({
  rand,
  spread,
  length,
}: {
  rand: () => number;
  spread: number;
  length: number;
}) => {
  const x = (rand() - 0.5) * (spread - 2);
  const z = -rand() * length;
  const y = 0.9 + rand() * 0.2;
  const hue = rand();
  const color = new THREE.Color().setHSL(hue, 0.35, 0.55);

  return (
    <group position={[x, y, z]}>
      <mesh>
        <capsuleGeometry args={[0.25, 0.6, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#e8c39e" />
      </mesh>
    </group>
  );
};
