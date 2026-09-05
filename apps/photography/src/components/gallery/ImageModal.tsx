import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";

import type { Image as ImageT } from "../../utils/file";

// Full-screen viewing goes through Next's image optimizer at a sane width
// (the R2 originals are up to ~9 MB) — same-origin, so no CORS issue.
const optimized = (path: string, w: number, q: number) =>
  `/_next/image?url=${encodeURIComponent(path)}&w=${w}&q=${q}`;

export const modalSrc = (image: ImageT) => optimized(image.path, 1920, 80);
const thumbSrc = (image: ImageT) => optimized(image.path, 32, 30);

// Called while the player is still walking up to a piece, so the bytes are
// already cached by the time they open it.
export const preloadModalImage = (image: ImageT) => {
  if (typeof window === "undefined") return;
  new window.Image().src = thumbSrc(image);
  new window.Image().src = modalSrc(image);
};

const rgb = (image: ImageT) =>
  `rgb(${Math.round(image.color.r)}, ${Math.round(image.color.g)}, ${Math.round(image.color.b)})`;

type ImageModalProps = {
  image: ImageT | null;
  onClose: () => void;
};

export const ImageModal = ({ image, onClose }: ImageModalProps) => (
  <Dialog open={!!image} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      {image && <ModalContents key={image.path} image={image} onClose={onClose} />}
    </div>
  </Dialog>
);

const ModalContents = ({ image, onClose }: { image: ImageT; onClose: () => void }) => {
  const [loaded, setLoaded] = useState(false);

  // Guarantee the reveal even if the image was already cached (onLoad can
  // fire before React attaches the handler for a warm image).
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, []);

  const aspect =
    image.exif.width && image.exif.height ? image.exif.width / image.exif.height : 3 / 2;

  return (
    <Dialog.Panel className="flex max-h-full w-full max-w-5xl flex-col items-center gap-3">
      <div
        className="relative max-h-[78vh] w-full overflow-hidden rounded-sm"
        style={{ aspectRatio: String(aspect), backgroundColor: rgb(image) }}
      >
        {/* biome-ignore lint/performance/noImgElement: hitting Next's optimizer URL directly for full control over the blur-up */}
        <img
          src={thumbSrc(image)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
        />
        {/* biome-ignore lint/performance/noImgElement: see above */}
        <img
          src={modalSrc(image)}
          alt=""
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/75">
        <span>
          {image.exif.make} {image.exif.model}
        </span>
        <span>{image.exif.focalLength}</span>
        <span>{image.exif.aperture}</span>
        <span>{image.exif.exposure}</span>
        <span>ISO {image.exif.iso}</span>
        <button type="button" onClick={onClose} className="ml-2 underline underline-offset-2">
          Close
        </button>
      </div>
    </Dialog.Panel>
  );
};
