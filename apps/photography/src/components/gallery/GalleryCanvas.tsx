import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Image as ImageT } from "../../utils/file";
// Import straight from these submodules, not the "../../utils" barrel — that
// barrel also re-exports the S3/sharp/EXIF build-time code, which would then
// get pulled into this client bundle.
import type { Gallery, ImageSlot } from "../../utils/gallery";
import { ImageModal, preloadModalImage } from "./ImageModal";
import { Joystick } from "./Joystick";
import { NpcCrowd } from "./Npc";
import { PlayerControls } from "./PlayerControls";
import { Scene } from "./Scene";

type GalleryCanvasProps = { gallery: Gallery };

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
export default function GalleryCanvas({ gallery }: GalleryCanvasProps) {
  const [target, setTarget] = useState<ImageSlot | null>(null);
  const [activeImage, setActiveImage] = useState<ImageT | null>(null);
  const joystickRef = useRef({ x: 0, y: 0 });

  const openImage = useCallback((image: ImageT) => setActiveImage(image), []);

  // Warm the full-screen image as soon as the player is near a piece, so
  // opening it feels instant.
  const handleTarget = useCallback((slot: ImageSlot | null) => {
    setTarget(slot);
    if (slot) preloadModalImage(slot.image);
  }, []);

  return (
    <div className="relative h-full w-full touch-none overflow-hidden bg-[#f5f2ea]">
      <Canvas camera={{ fov: 68, position: [0, 1.6, 3], near: 0.1, far: 80 }}>
        <fog attach="fog" args={["#faf8f2", 12, 46]} />
        {/* Bright, shadow-less fill — hemisphere + ambient do the "airy
            room" work; the two point lights add a little warmth and depth. */}
        <hemisphereLight args={["#fdfbf6", "#d7ccb7", 1]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 14, 4]} intensity={0.85} />
        <ForceResize />
        <Scene gallery={gallery} />
        <NpcCrowd gallery={gallery} />
        <PlayerControls
          gallery={gallery}
          joystickRef={joystickRef}
          onTargetChange={handleTarget}
          onOpenImage={openImage}
        />
      </Canvas>

      {target && !activeImage && (
        <button
          type="button"
          onClick={() => openImage(target.image)}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded bg-black/80 px-4 py-2 text-sm text-white"
        >
          Press E / tap here to view
        </button>
      )}

      <Joystick valueRef={joystickRef} />
      <ImageModal image={activeImage} onClose={() => setActiveImage(null)} />
    </div>
  );
}
