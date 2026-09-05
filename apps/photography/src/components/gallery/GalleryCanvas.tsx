import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Image as ImageT } from "../../utils/file";
// Import directly from these submodules (not the top-level "../../utils"
// barrel) — that barrel also re-exports the S3/sharp/EXIF build-time utils,
// which would otherwise get pulled into this client bundle.
import { CORRIDOR_SPACING, corridorLength, type ImageSlot, type Room } from "../../utils/gallery";
import { ImageModal } from "./ImageModal";
import { Joystick } from "./Joystick";
import { PlayerControls } from "./PlayerControls";
import { Scene } from "./Scene";

type GalleryCanvasProps = { rooms: Room[] };

// react-use-measure's ResizeObserver (which R3F's Canvas uses to size
// itself) can take its first reading before this dynamically-mounted
// component's container has settled into its final layout size, and then
// never fire again since nothing actually resizes afterwards — leaving the
// canvas stuck at the browser's 300x150 default. Re-measure once after the
// first paint as a belt-and-braces fix.
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
export default function GalleryCanvas({ rooms }: GalleryCanvasProps) {
  const [target, setTarget] = useState<ImageSlot | null>(null);
  const [activeImage, setActiveImage] = useState<ImageT | null>(null);
  const joystickRef = useRef({ x: 0, y: 0 });
  const length = corridorLength(rooms);

  const openImage = useCallback((image: ImageT) => setActiveImage(image), []);

  return (
    <div className="relative h-full w-full touch-none overflow-hidden bg-[#f5f2ea]">
      <Canvas camera={{ fov: 70, position: [0, 1.7, 2], near: 0.1, far: 60 }}>
        <fog attach="fog" args={["#faf8f2", 10, 40]} />
        {/* Hemisphere + ambient fill (no shadows) is what makes this read as
            a bright, airy room — a directional light with castShadow was
            tried and its default shadow-camera frustum doesn't cover the
            corridor's length, which broke rendering entirely. */}
        <hemisphereLight args={["#fdfbf6", "#d8cdb8", 0.9]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 12, 4]} intensity={1.1} />
        <ForceResize />
        <Scene rooms={rooms} />
        <PlayerControls
          rooms={rooms}
          joystickRef={joystickRef}
          onTargetChange={setTarget}
          onOpenImage={openImage}
          zBounds={[-length, CORRIDOR_SPACING / 2]}
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
