import { MeshReflectorMaterial, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Component, type ReactNode, Suspense, useRef, useState } from "react";
import * as THREE from "three";

import {
  CORRIDOR_HALF_WIDTH,
  FRONT_WALL_OFFSET,
  type Gallery,
  type ImageSlot,
  MAX_ROOM_DEPTH,
  type Room,
  STAIR_RUN,
  STAIR_STEPS,
  type Stairs,
  type Vec3,
} from "../../utils/gallery";
import { autopilot, playerPose, useGallery } from "./state";

// ── Palette ─────────────────────────────────────────────────────────────
const WALL = "#f6f3ec";
const WALL_TRIM = "#e4ddcd";
const FLOOR = "#b7936c";
const FLOOR_TRIM = "#8a6a49";
const CEILING = "#fbfaf7";
const COLUMN = "#efe9dd";
const FRAME_DARK = "#1a181c";
const MAT = "#f8f6f0";
const WOOD = "#6d4f36";
const METAL = "#c7c7c7";
const PLINTH = "#ece6da";
const CEIL_HEIGHT_0 = 5.6;
const CEIL_HEIGHT_1 = 9.6;

type SceneProps = { gallery: Gallery };

export const Scene = ({ gallery }: SceneProps) => {
  const { rooms, stairs, bounds } = gallery;
  const floorWidth = (CORRIDOR_HALF_WIDTH + MAX_ROOM_DEPTH + 2) * 2;

  // Level 0 runs from the front of the gallery to the foot of the stairs;
  // level 1 from the top of the stairs to the back.
  const l0Mid = (bounds.maxZ + stairs.bottomZ) / 2;
  const l0Span = bounds.maxZ - stairs.bottomZ;
  const l1Mid = (stairs.topZ + bounds.minZ) / 2;
  const l1Span = stairs.topZ - bounds.minZ;

  return (
    <group>
      {/* Level 0 shell */}
      <GalleryFloor position={[0, 0, l0Mid]} size={[floorWidth, l0Span]} reflective />
      <Slab position={[0, CEIL_HEIGHT_0, l0Mid]} size={[floorWidth, l0Span]} color={CEILING} flip />

      {/* Level 1 shell */}
      <GalleryFloor position={[0, gallery.levelHeight, l1Mid]} size={[floorWidth, l1Span]} />
      <Slab position={[0, CEIL_HEIGHT_1, l1Mid]} size={[floorWidth, l1Span]} color={CEILING} flip />

      {/* End caps: the entrance wall behind the spawn, the far wall at the back */}
      <mesh position={[0, CEIL_HEIGHT_0 / 2, bounds.maxZ]}>
        <planeGeometry args={[floorWidth, CEIL_HEIGHT_0]} />
        <meshStandardMaterial color={WALL} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, (gallery.levelHeight + CEIL_HEIGHT_1) / 2, bounds.minZ]}>
        <planeGeometry args={[floorWidth, CEIL_HEIGHT_1 - gallery.levelHeight]} />
        <meshStandardMaterial color={WALL} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Fascia under the upper floor's leading edge */}
      <mesh position={[0, gallery.levelHeight - 0.2, stairs.topZ + 0.15]}>
        <boxGeometry args={[floorWidth, 0.4, 0.3]} />
        <meshStandardMaterial color={WALL_TRIM} roughness={0.9} />
      </mesh>

      <Staircase stairs={stairs} levelHeight={gallery.levelHeight} />

      {/* Emissive strips — actual light comes from <Lighting> */}
      <CeilingLights fromZ={bounds.maxZ} toZ={stairs.bottomZ} y={CEIL_HEIGHT_0 - 0.05} />
      <CeilingLights fromZ={stairs.topZ} toZ={bounds.minZ} y={CEIL_HEIGHT_1 - 0.05} />

      {rooms.map((room) => (
        <RoomView key={room.id} room={room} />
      ))}
    </group>
  );
};

// ── Shell primitives ────────────────────────────────────────────────────
const Slab = ({
  position,
  size,
  color,
  flip,
}: {
  position: [number, number, number];
  size: [number, number];
  color: string;
  flip?: boolean;
}) => (
  <mesh position={position} rotation={[flip ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
    <planeGeometry args={[size[0], Math.abs(size[1])]} />
    <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
  </mesh>
);

// The floor a visitor actually notices: a wet-look reflection of the frames
// and lamps on "high", a plain matte plane on "lite".
const GalleryFloor = ({
  position,
  size,
  reflective,
}: {
  position: [number, number, number];
  size: [number, number];
  // A reflector re-renders the whole scene into a render target every frame,
  // so only the level the player spends time on gets one — the upper level
  // is a plain matte plane.
  reflective?: boolean;
}) => {
  const hq = useGallery((s) => s.quality) === "high";
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size[0], Math.abs(size[1])]} />
      {hq && reflective ? (
        <MeshReflectorMaterial
          color={FLOOR}
          resolution={256}
          mixBlur={1}
          mixStrength={2}
          blur={[192, 64]}
          mirror={0.3}
          metalness={0.12}
          roughness={0.9}
          depthScale={0.4}
          minDepthThreshold={0.5}
          maxDepthThreshold={1.2}
        />
      ) : (
        <meshStandardMaterial color={FLOOR} roughness={0.86} />
      )}
    </mesh>
  );
};

const CeilingLights = ({ fromZ, toZ, y }: { fromZ: number; toZ: number; y: number }) => {
  const mid = (fromZ + toZ) / 2;
  const span = Math.abs(fromZ - toZ);
  return (
    <mesh position={[0, y, mid]}>
      <boxGeometry args={[0.4, 0.06, Math.max(span - 4, 1)]} />
      <meshStandardMaterial color="#ffffff" emissive="#fff6e6" emissiveIntensity={1.4} />
    </mesh>
  );
};

// ── Staircase ───────────────────────────────────────────────────────────
const Staircase = ({ stairs, levelHeight }: { stairs: Stairs; levelHeight: number }) => {
  const stepDepth = STAIR_RUN / STAIR_STEPS;
  const slope = Math.atan2(levelHeight, STAIR_RUN);
  const railLen = Math.hypot(STAIR_RUN, levelHeight);
  const midZ = (stairs.bottomZ + stairs.topZ) / 2;

  return (
    <group>
      {Array.from({ length: STAIR_STEPS }, (_, i) => {
        const topY = ((i + 1) / STAIR_STEPS) * levelHeight;
        const z = stairs.bottomZ - (i + 0.5) * stepDepth;
        return (
          <mesh key={i} position={[0, topY / 2, z]}>
            <boxGeometry args={[stairs.width, topY, stepDepth + 0.02]} />
            <meshStandardMaterial color={i % 2 ? FLOOR : FLOOR_TRIM} roughness={0.8} />
          </mesh>
        );
      })}

      {[-1, 1].map((sign) => {
        const x = sign * (stairs.width / 2 - 0.1);
        return (
          <group key={sign}>
            <mesh position={[x, levelHeight / 2 + 1, midZ]} rotation={[slope, 0, 0]}>
              <boxGeometry args={[0.08, 0.08, railLen]} />
              <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
            </mesh>
            {Array.from({ length: 6 }, (_, i) => {
              const t = (i + 0.5) / 6;
              const y = t * levelHeight;
              const z = stairs.bottomZ - t * STAIR_RUN;
              return (
                <mesh key={i} position={[x, y + 0.5, z]}>
                  <boxGeometry args={[0.05, 1, 0.05]} />
                  <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// ── Rooms ───────────────────────────────────────────────────────────────
const RoomView = ({ room }: { room: Room }) => {
  const sign = room.side === "left" ? -1 : 1;
  const [, baseY, cz] = room.center;
  const { width, depth, height } = room.size;
  const halfW = width / 2;
  const backWallX = sign * (CORRIDOR_HALF_WIDTH + depth);
  const frontX = sign * (CORRIDOR_HALF_WIDTH + FRONT_WALL_OFFSET);
  const accent = `rgb(${Math.round(room.accentColor.r)}, ${Math.round(room.accentColor.g)}, ${Math.round(
    room.accentColor.b
  )})`;
  const openW = Math.min(width - 0.6, 7);
  const doorHalf = 1.35;
  const doorHeight = 2.5;

  return (
    <group>
      {/* Back wall + trim */}
      <mesh position={[backWallX, baseY + height / 2, cz]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={WALL} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[backWallX - sign * 0.05, baseY + 0.12, cz]}>
        <boxGeometry args={[0.1, 0.24, width]} />
        <meshStandardMaterial color={WALL_TRIM} roughness={0.9} />
      </mesh>
      <mesh position={[backWallX - sign * 0.05, baseY + height - 0.35, cz]}>
        <boxGeometry args={[0.08, 0.06, width]} />
        <meshStandardMaterial color={WALL_TRIM} roughness={0.9} />
      </mesh>

      {/* Carpet runner in the room's accent colour */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[sign * (CORRIDOR_HALF_WIDTH + depth / 2), baseY + 0.015, cz]}
      >
        <planeGeometry args={[depth - 1, width - 1.4]} />
        <meshStandardMaterial color={accent} roughness={0.9} />
      </mesh>

      {room.enclosed ? (
        <EnclosedShell
          sign={sign}
          baseY={baseY}
          cz={cz}
          halfW={halfW}
          height={height}
          frontX={frontX}
          backWallX={backWallX}
          doorHalf={doorHalf}
          doorHeight={doorHeight}
        />
      ) : (
        <PortalFrame sign={sign} baseY={baseY} cz={cz} openW={openW} />
      )}

      {room.hasBench && (
        <Bench
          position={[sign * (CORRIDOR_HALF_WIDTH - 1.1), baseY, cz]}
          rotationY={sign > 0 ? -Math.PI / 2 : Math.PI / 2}
        />
      )}
      {room.hasPlinth && (
        <Plinth
          position={[sign * (CORRIDOR_HALF_WIDTH + depth * 0.62), baseY, cz]}
          color={accent}
        />
      )}

      {/* Track lights over the opening */}
      {[-1.6, 1.6].map((dz) => (
        <TrackLight
          key={dz}
          position={[sign * CORRIDOR_HALF_WIDTH, baseY + height + 0.3, cz + dz]}
          sign={sign}
        />
      ))}

      {room.slots.map((slot) => (
        <FrameBoundary key={slot.image.path}>
          <ArtFrame slot={slot} />
        </FrameBoundary>
      ))}
    </group>
  );
};

const EnclosedShell = ({
  sign,
  baseY,
  cz,
  halfW,
  height,
  frontX,
  backWallX,
  doorHalf,
  doorHeight,
}: {
  sign: number;
  baseY: number;
  cz: number;
  halfW: number;
  height: number;
  frontX: number;
  backWallX: number;
  doorHalf: number;
  doorHeight: number;
}) => {
  const spanX = Math.abs(backWallX - frontX);
  const midX = (backWallX + frontX) / 2;
  const segLen = halfW - doorHalf;
  return (
    <group>
      {[cz - halfW, cz + halfW].map((wz) => (
        <mesh key={wz} position={[midX, baseY + height / 2, wz]}>
          <boxGeometry args={[spanX, height, 0.14]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
      {[cz - doorHalf - segLen / 2, cz + doorHalf + segLen / 2].map((sz) => (
        <mesh key={sz} position={[frontX, baseY + height / 2, sz]}>
          <boxGeometry args={[0.16, height, segLen]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
      {/* Lintel above the doorway */}
      <mesh position={[frontX, baseY + (doorHeight + height) / 2, cz]}>
        <boxGeometry args={[0.16, height - doorHeight, doorHalf * 2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {/* Doorframe */}
      {[cz - doorHalf, cz + doorHalf].map((jz) => (
        <mesh key={jz} position={[frontX, baseY + doorHeight / 2, jz]}>
          <boxGeometry args={[0.24, doorHeight, 0.16]} />
          <meshStandardMaterial color={WALL_TRIM} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[frontX, baseY + doorHeight, cz]}>
        <boxGeometry args={[0.24, 0.16, doorHalf * 2 + 0.3]} />
        <meshStandardMaterial color={WALL_TRIM} roughness={0.8} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[sign * CORRIDOR_HALF_WIDTH, baseY + 0.02, cz]}
      >
        <planeGeometry args={[0.5, doorHalf * 2]} />
        <meshStandardMaterial color={FLOOR_TRIM} roughness={0.8} />
      </mesh>
    </group>
  );
};

const PortalFrame = ({
  sign,
  baseY,
  cz,
  openW,
}: {
  sign: number;
  baseY: number;
  cz: number;
  openW: number;
}) => {
  const lintelY = 3.3;
  return (
    <group>
      {[cz - openW / 2, cz + openW / 2].map((jz) => (
        <mesh key={jz} position={[sign * CORRIDOR_HALF_WIDTH, baseY + lintelY / 2, jz]}>
          <boxGeometry args={[0.6, lintelY, 0.4]} />
          <meshStandardMaterial color={COLUMN} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[sign * CORRIDOR_HALF_WIDTH, baseY + lintelY, cz]}>
        <boxGeometry args={[0.6, 0.4, openW + 0.4]} />
        <meshStandardMaterial color={COLUMN} roughness={0.9} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[sign * CORRIDOR_HALF_WIDTH, baseY + 0.02, cz]}
      >
        <planeGeometry args={[0.6, openW]} />
        <meshStandardMaterial color={FLOOR_TRIM} roughness={0.8} />
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
    <RoundedBox args={[1.8, 0.14, 0.55]} radius={0.05} smoothness={2} position={[0, 0.46, 0]}>
      <meshStandardMaterial color={WOOD} roughness={0.55} />
    </RoundedBox>
    {[-0.7, 0.7].map((x) => (
      <RoundedBox
        key={x}
        args={[0.12, 0.46, 0.5]}
        radius={0.04}
        smoothness={2}
        position={[x, 0.23, 0]}
      >
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
      </RoundedBox>
    ))}
  </group>
);

const Plinth = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 1.1, 0.7]} />
        <meshStandardMaterial color={PLINTH} roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, 1.5, 0]}>
        <icosahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} flatShading />
      </mesh>
    </group>
  );
};

const TrackLight = ({ position, sign }: { position: [number, number, number]; sign: number }) => (
  <group position={position} rotation={[0, 0, sign * 0.5]}>
    <mesh>
      <cylinderGeometry args={[0.08, 0.08, 0.26, 8]} />
      <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
    </mesh>
    <mesh position={[0, -0.16, 0]}>
      <cylinderGeometry args={[0.07, 0.09, 0.06, 8]} />
      <meshStandardMaterial color="#fff" emissive="#ffedcf" emissiveIntensity={1.8} />
    </mesh>
  </group>
);

// ── Art frames ──────────────────────────────────────────────────────────
const textureUrl = (path: string, width: number) =>
  `/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=78`;

// Load radius with hysteresis: a full-res photo is ~2 MB of VRAM, so only
// the handful of frames the visitor is actually near hold a texture. The
// rest show their dominant-colour swatch until you walk over.
const LOAD_IN = 22;
const LOAD_OUT = 30;

const useNearby = (pos: Vec3): boolean => {
  const [near, setNear] = useState(false);
  const state = useRef(false);
  useFrame(() => {
    const dx = pos[0] - playerPose.x;
    const dz = pos[2] - playerPose.z;
    const d2 = dx * dx + dz * dz;
    const want = state.current ? d2 < LOAD_OUT * LOAD_OUT : d2 < LOAD_IN * LOAD_IN;
    if (want !== state.current) {
      state.current = want;
      setNear(want);
    }
  });
  return near;
};

const ArtImage = ({ url, width, height }: { url: string; width: number; height: number }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[0, 0, 0.067]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

const ArtFrame = ({ slot }: { slot: ImageSlot }) => {
  const { width, height } = slot;
  const sign = Math.sign(slot.position[0]) || 1;
  const near = useNearby(slot.position);
  const { r, g, b } = slot.image.color;
  const swatch = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  return (
    <group
      position={slot.position}
      rotation={[0, slot.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        // Walk to a viewing spot ~2.4 units out from this piece, square to it.
        autopilot.target = [slot.position[0] - sign * 2.4, 0, slot.position[2]];
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <RoundedBox args={[width + 0.24, height + 0.24, 0.1]} radius={0.02} smoothness={2}>
        <meshStandardMaterial color={FRAME_DARK} roughness={0.45} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0, 0.052]}>
        <boxGeometry args={[width + 0.12, height + 0.12, 0.02]} />
        <meshStandardMaterial color={MAT} roughness={0.9} />
      </mesh>
      {/* dominant-colour stand-in, always present */}
      <mesh position={[0, 0, 0.064]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={swatch} toneMapped={false} />
      </mesh>
      {near && (
        <Suspense fallback={null}>
          <ArtImage url={textureUrl(slot.image.path, 828)} width={width} height={height} />
        </Suspense>
      )}
      <mesh position={[0, -(height / 2) - 0.32, 0.04]}>
        <boxGeometry args={[0.46, 0.15, 0.02]} />
        <meshStandardMaterial color="#e9e4d8" roughness={0.85} />
      </mesh>
    </group>
  );
};

// A texture-load failure throws during render, past Suspense (which only
// catches pending promises). Scoped per frame so one bad image just drops
// that frame instead of the whole gallery.
class FrameBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Gallery frame failed to load", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
