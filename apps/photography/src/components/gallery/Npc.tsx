import { useFrame } from "@react-three/fiber";
import { Component, type ReactNode, type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";

import { CORRIDOR_HALF_WIDTH, type Gallery, groundHeightAt } from "../../utils/gallery";
import { mulberry32 } from "./random";

const SKIN = ["#e8c39e", "#d9a679", "#c98e63", "#8d5a3c", "#f1d2b6"];
const HAIR = ["#2b2b2b", "#4a3728", "#6b6b6b", "#1a1a1a", "#7a5230"];

type Stop = { pos: THREE.Vector3; look: THREE.Vector3 | null };

const angleLerp = (from: number, to: number, t: number) => {
  let d = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d * t;
};

// ── The crowd ───────────────────────────────────────────────────────────
export const NpcCrowd = ({ gallery }: { gallery: Gallery }) => {
  const { stops, specs } = useMemo(() => {
    const rand = mulberry32(Math.imul(gallery.rooms.length + 7, 40503));

    const viewpoints: Stop[] = [];
    const waypoints: Stop[] = [];
    for (const room of gallery.rooms) {
      const sign = room.side === "left" ? -1 : 1;
      const [, , cz] = room.center;
      waypoints.push({
        pos: new THREE.Vector3((rand() - 0.5) * 2.6, 0, cz + (rand() - 0.5) * 3.5),
        look: null,
      });
      if (!room.enclosed) {
        for (const slot of room.slots) {
          if (rand() < 0.6) continue;
          viewpoints.push({
            pos: new THREE.Vector3(
              sign * (CORRIDOR_HALF_WIDTH - 0.7),
              0,
              slot.position[2] + (rand() - 0.5) * 0.6
            ),
            look: new THREE.Vector3(slot.position[0], slot.position[1], slot.position[2]),
          });
        }
      }
    }
    if (viewpoints.length === 0) viewpoints.push(...waypoints);

    const allStops = [...viewpoints, ...waypoints];
    const count =
      waypoints.length === 0
        ? 0
        : Math.max(4, Math.min(12, Math.round(gallery.rooms.length * 1.4)));
    const specs = Array.from({ length: count }, (_, i) => {
      const start = waypoints[i % waypoints.length];
      return {
        id: i,
        start: start.pos.clone(),
        hue: rand(),
        skin: SKIN[Math.floor(rand() * SKIN.length)],
        hair: HAIR[Math.floor(rand() * HAIR.length)],
        legColor: `hsl(${Math.round(rand() * 40 + 210)}, 12%, ${Math.round(rand() * 12 + 22)}%)`,
        scale: 0.9 + rand() * 0.22,
        speed: 0.7 + rand() * 0.5,
        seed: (i + 1) * 9176,
      };
    });

    return { stops: { viewpoints, waypoints, all: allStops }, specs };
  }, [gallery]);

  if (specs.length === 0) return null;

  return (
    <CrowdBoundary>
      <group>
        {specs.map((spec) => (
          <Npc key={spec.id} spec={spec} gallery={gallery} stops={stops} />
        ))}
      </group>
    </CrowdBoundary>
  );
};

// ── One visitor ─────────────────────────────────────────────────────────
const Npc = ({
  spec,
  gallery,
  stops,
}: {
  spec: {
    start: THREE.Vector3;
    hue: number;
    skin: string;
    hair: string;
    legColor: string;
    scale: number;
    speed: number;
    seed: number;
  };
  gallery: Gallery;
  stops: { viewpoints: Stop[]; waypoints: Stop[]; all: Stop[] };
}) => {
  const group = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  const garment = useMemo(() => new THREE.Color().setHSL(spec.hue, 0.34, 0.5), [spec.hue]);
  const sleeve = useMemo(() => garment.clone().offsetHSL(0, 0, -0.08), [garment]);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  const st = useRef({
    rand: mulberry32(spec.seed),
    pos: spec.start.clone(),
    facing: 0,
    mode: "walk" as "walk" | "view",
    timer: 0,
    t: spec.seed % 10,
    bob: 0,
    target: spec.start.clone(),
    pendingLook: null as THREE.Vector3 | null,
    look: null as THREE.Vector3 | null,
    emote: 0,
  });

  const pickTarget = () => {
    const s = st.current;
    const pool =
      s.rand() < 0.65 && stops.viewpoints.length > 0 ? stops.viewpoints : stops.waypoints;
    const choice = pool[Math.floor(s.rand() * pool.length)] ?? stops.all[0];
    s.target.copy(choice.pos);
    s.pendingLook = choice.look;
  };

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const s = st.current;
    const dt = Math.min(delta, 0.05);
    s.t += dt;

    if (s.mode === "walk") {
      scratch.set(s.target.x - s.pos.x, 0, s.target.z - s.pos.z);
      const d = scratch.length();
      if (d < 0.45) {
        s.mode = "view";
        s.timer = 3 + s.rand() * 4.5;
        s.emote = Math.floor(s.rand() * 4);
        s.look = s.pendingLook;
      } else {
        scratch.multiplyScalar((spec.speed * dt) / d);
        s.pos.x += scratch.x;
        s.pos.z += scratch.z;
        s.facing = angleLerp(s.facing, Math.atan2(scratch.x, scratch.z), 0.16);
        const swing = Math.sin(s.t * 8) * 0.5;
        if (legL.current) legL.current.rotation.x = swing;
        if (legR.current) legR.current.rotation.x = -swing;
        if (armL.current)
          armL.current.rotation.x = THREE.MathUtils.lerp(
            armL.current.rotation.x,
            -swing * 0.4,
            0.2
          );
        if (armR.current)
          armR.current.rotation.x = THREE.MathUtils.lerp(armR.current.rotation.x, swing * 0.4, 0.2);
        relax(head, torso);
      }
      s.bob = Math.abs(Math.sin(s.t * 8)) * 0.045;
    } else {
      s.timer -= dt;
      if (s.look) {
        s.facing = angleLerp(s.facing, Math.atan2(s.look.x - s.pos.x, s.look.z - s.pos.z), 0.1);
      }
      s.bob = THREE.MathUtils.lerp(s.bob, 0, 0.1);
      if (legL.current)
        legL.current.rotation.x = THREE.MathUtils.lerp(legL.current.rotation.x, 0, 0.15);
      if (legR.current)
        legR.current.rotation.x = THREE.MathUtils.lerp(legR.current.rotation.x, 0, 0.15);
      emote(s.emote, s.t, { head, armL, armR, torso });
      if (s.timer <= 0) {
        s.mode = "walk";
        pickTarget();
      }
    }

    g.position.set(s.pos.x, groundHeightAt(gallery, s.pos.z) + s.bob, s.pos.z);
    g.rotation.y = s.facing;
  });

  return (
    <group ref={group} scale={spec.scale} position={[spec.start.x, spec.start.y, spec.start.z]}>
      <group ref={torso}>
        <mesh position={[0, 0.95, 0]}>
          <capsuleGeometry args={[0.16, 0.5, 3, 6]} />
          <meshStandardMaterial color={garment} roughness={0.85} />
        </mesh>
        <group ref={head} position={[0, 1.48, 0]}>
          <mesh>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color={spec.skin} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.06, -0.02]}>
            <sphereGeometry args={[0.135, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={spec.hair} roughness={0.9} />
          </mesh>
        </group>
        <group ref={armL} position={[-0.21, 1.3, 0]}>
          <mesh position={[0, -0.24, 0]}>
            <capsuleGeometry args={[0.05, 0.4, 3, 5]} />
            <meshStandardMaterial color={sleeve} roughness={0.85} />
          </mesh>
        </group>
        <group ref={armR} position={[0.21, 1.3, 0]}>
          <mesh position={[0, -0.24, 0]}>
            <capsuleGeometry args={[0.05, 0.4, 3, 5]} />
            <meshStandardMaterial color={sleeve} roughness={0.85} />
          </mesh>
        </group>
      </group>
      <group ref={legL} position={[-0.09, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.06, 0.46, 3, 5]} />
          <meshStandardMaterial color={spec.legColor} roughness={0.8} />
        </mesh>
      </group>
      <group ref={legR} position={[0.09, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.06, 0.46, 3, 5]} />
          <meshStandardMaterial color={spec.legColor} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

type GroupRef = RefObject<THREE.Group>;
type Parts = { head: GroupRef; armL: GroupRef; armR: GroupRef; torso: GroupRef };

const relax = (head: GroupRef, torso: GroupRef) => {
  if (head.current) {
    head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, 0, 0.1);
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, 0, 0.1);
    head.current.rotation.z = THREE.MathUtils.lerp(head.current.rotation.z, 0, 0.1);
  }
  if (torso.current)
    torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, 0, 0.1);
};

// Small, readable reactions to the artwork.
const emote = (kind: number, t: number, { head, armL, armR, torso }: Parts) => {
  const h = head.current;
  const tr = torso.current;
  const al = armL.current;
  const ar = armR.current;
  if (!h || !tr || !al || !ar) return;

  if (kind === 0) {
    // scanning the piece
    h.rotation.y = Math.sin(t * 0.7) * 0.36;
    h.rotation.x = Math.sin(t * 0.5) * 0.08;
    h.rotation.z = THREE.MathUtils.lerp(h.rotation.z, 0, 0.1);
    tr.rotation.x = THREE.MathUtils.lerp(tr.rotation.x, 0, 0.1);
    al.rotation.x = THREE.MathUtils.lerp(al.rotation.x, 0, 0.1);
    ar.rotation.x = THREE.MathUtils.lerp(ar.rotation.x, 0, 0.1);
  } else if (kind === 1) {
    // approving nod
    h.rotation.x = -0.12 + Math.sin(t * 2.4) * 0.12;
    h.rotation.y = THREE.MathUtils.lerp(h.rotation.y, 0, 0.1);
    tr.rotation.x = THREE.MathUtils.lerp(tr.rotation.x, 0.03, 0.1);
    al.rotation.x = THREE.MathUtils.lerp(al.rotation.x, 0, 0.1);
    ar.rotation.x = THREE.MathUtils.lerp(ar.rotation.x, 0, 0.1);
  } else if (kind === 2) {
    // hand to chin, considering
    ar.rotation.x = THREE.MathUtils.lerp(ar.rotation.x, -1.9, 0.15);
    ar.rotation.z = THREE.MathUtils.lerp(ar.rotation.z, -0.5, 0.15);
    al.rotation.x = THREE.MathUtils.lerp(al.rotation.x, 0, 0.1);
    h.rotation.z = THREE.MathUtils.lerp(h.rotation.z, 0.14, 0.1);
    h.rotation.x = THREE.MathUtils.lerp(h.rotation.x, 0.05, 0.1);
    tr.rotation.x = THREE.MathUtils.lerp(tr.rotation.x, 0.05, 0.1);
  } else {
    // leaning in for a closer look
    tr.rotation.x = THREE.MathUtils.lerp(tr.rotation.x, 0.16, 0.08);
    h.rotation.x = THREE.MathUtils.lerp(h.rotation.x, 0.04, 0.1);
    al.rotation.x = THREE.MathUtils.lerp(al.rotation.x, 0.55, 0.1);
    ar.rotation.x = THREE.MathUtils.lerp(ar.rotation.x, 0.55, 0.1);
  }
};

class CrowdBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Gallery crowd failed", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
