import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Image as ImageT } from "../../utils/file";
// Import straight from these submodules, not the "../../utils" barrel — that
// barrel also re-exports the S3/sharp/EXIF build-time code, which would then
// get pulled into this client bundle.
import { buildGallery } from "../../utils/gallery/buildRooms";
import { Atmosphere } from "./Atmosphere";
import { GalleryHud } from "./GalleryHud";
import { ImageModal, preloadModalImage } from "./ImageModal";
import { Joystick } from "./Joystick";
import { Lighting } from "./Lighting";
import { Minimap } from "./Minimap";
import { NpcCrowd } from "./Npc";
import { Placard } from "./Placard";
import { PlayerControls } from "./PlayerControls";
import { PostFx } from "./PostFx";
import { Reactions } from "./Reactions";
import { Scene } from "./Scene";
import { emitReaction, joystickProxy, useGallery } from "./state";
import { TourController } from "./TourController";

type GalleryCanvasProps = { images: ImageT[] };

const FOG = { day: "#faf8f2", evening: "#100c1a" } as const;

// react-use-measure's ResizeObserver (which R3F's Canvas uses to size
// itself) can take its first reading before this dynamically-mounted
// component's container has settled, and then never fire again — leaving the
// canvas stuck at the browser's 300x150 default. Re-measure after first
// paint as a belt-and-braces fix.
const ForceResize = () => {
  const { gl, camera } = useThree();

  useEffect(() => {
    const apply = () => {
      const parent = gl.domElement.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      gl.setSize(width, height);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    apply();
    const timers = [requestAnimationFrame(apply), setTimeout(apply, 300)];
    return () => {
      cancelAnimationFrame(timers[0] as number);
      clearTimeout(timers[1] as ReturnType<typeof setTimeout>);
    };
  }, [gl, camera]);

  return null;
};

// Client-only (needs window/canvas) — always mounted via
// dynamic(() => import(...), { ssr: false }) from pages/gallery.tsx.
export default function GalleryCanvas({ images }: GalleryCanvasProps) {
  const seed = useGallery((s) => s.seed);
  const target = useGallery((s) => s.target);
  const timeOfDay = useGallery((s) => s.timeOfDay);
  const quality = useGallery((s) => s.quality);
  const [activeImage, setActiveImage] = useState<ImageT | null>(null);

  const gallery = useMemo(() => buildGallery(images, seed || images.length), [images, seed]);
  const ordered = useMemo(() => gallery.rooms.flatMap((room) => room.slots), [gallery]);

  // Warm the full-screen bytes as soon as a piece comes into focus.
  useEffect(() => {
    if (target) preloadModalImage(target.image);
  }, [target]);

  // A piece dropped from the layout on reshuffle shouldn't stay open.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reshuffle (seed) is the trigger, not activeImage
  useEffect(() => {
    setActiveImage(null);
  }, [seed]);

  // The in-world "E to inspect" key lives in PlayerControls; it asks to open
  // the modal through a window event so it doesn't need the setter threaded in.
  useEffect(() => {
    const onInspect = () => {
      const t = useGallery.getState().target;
      if (t) setActiveImage(t.image);
    };
    window.addEventListener("pg:inspect", onInspect);
    return () => window.removeEventListener("pg:inspect", onInspect);
  }, []);

  const step = (dir: 1 | -1) => {
    setActiveImage((cur) => {
      if (!cur) return cur;
      const i = ordered.findIndex((s) => s.image.path === cur.path);
      const next = ordered[(i + dir + ordered.length) % ordered.length];
      return next ? next.image : cur;
    });
  };

  const fog = FOG[timeOfDay];

  return (
    <div className="relative h-full w-full touch-none overflow-hidden bg-[#f5f2ea]">
      <Canvas
        // Cap the pixel budget — retina (dpr 2) quadruples fragment cost for a
        // gallery that reads fine at ~1.5. SMAA in the post stack does the
        // anti-aliasing when it's on, so skip MSAA there.
        dpr={[1, 1.5]}
        camera={{ fov: 68, position: [0, 1.6, 1.5], near: 0.1, far: 140 }}
        gl={{
          antialias: quality !== "high",
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
      >
        <color attach="background" args={[fog]} />
        <fog attach="fog" args={[fog, 14, timeOfDay === "evening" ? 40 : 62]} />
        <Lighting gallery={gallery} />
        <ForceResize />
        <Scene gallery={gallery} />
        <Atmosphere gallery={gallery} />
        <NpcCrowd gallery={gallery} />
        <PlayerControls gallery={gallery} />
        <TourController gallery={gallery} />
        <Placard />
        <Reactions />
        <PostFx />
      </Canvas>

      <GalleryHud />
      <Minimap gallery={gallery} />

      {target && !activeImage && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 flex -translate-x-1/2 gap-2">
          <button
            type="button"
            onClick={() => setActiveImage(target.image)}
            className="pointer-events-auto rounded bg-black/80 px-4 py-2 text-sm text-white"
          >
            Press E to inspect
          </button>
          <button
            type="button"
            onClick={() => {
              emitReaction([...target.position]);
              useGallery.getState().addHeart(target.image.path);
            }}
            className="pointer-events-auto rounded bg-black/80 px-3 py-2 text-sm text-white"
            aria-label="React with a heart"
          >
            ❤️
          </button>
        </div>
      )}

      <Joystick valueRef={joystickProxy} />
      <ImageModal
        image={activeImage}
        onClose={() => setActiveImage(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        index={activeImage ? ordered.findIndex((s) => s.image.path === activeImage.path) : -1}
        total={ordered.length}
      />
    </div>
  );
}
