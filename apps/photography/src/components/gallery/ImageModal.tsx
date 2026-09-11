import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

import type { Image as ImageT } from "../../utils/file";

// The full-screen viewer. Shared: /gallery opens it from a piece in focus,
// /list opens it from a grid thumbnail. Lives here because the gallery was
// its first caller — it has no 3D dependencies.

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
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
};

export const ImageModal = ({ image, onClose, onPrev, onNext, index, total }: ImageModalProps) => {
  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, onPrev, onNext]);

  return (
    <Dialog open={!!image} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/92" aria-hidden="true" />
      {/* Padded off the notch and the home indicator — the chrome (close,
          prev/next) is pinned to this box, not to the raw viewport. */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        {image && (
          <>
            <NavButton side="left" onClick={onPrev} />
            <NavButton side="right" onClick={onNext} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 text-white/70 hover:text-white"
            >
              <FiX size={22} />
            </button>
            <ModalContents key={image.path} image={image} index={index} total={total} />
          </>
        )}
      </div>
    </Dialog>
  );
};

const NavButton = ({ side, onClick }: { side: "left" | "right"; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={side === "left" ? "Previous piece" : "Next piece"}
    className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 ${
      side === "left" ? "left-3" : "right-3"
    }`}
  >
    {side === "left" ? <FiChevronLeft size={26} /> : <FiChevronRight size={26} />}
  </button>
);

const ModalContents = ({
  image,
  index,
  total,
}: {
  image: ImageT;
  index: number;
  total: number;
}) => {
  const [loaded, setLoaded] = useState(false);

  // Guarantee the reveal even if the image was already cached (onLoad can
  // fire before React attaches the handler for a warm image).
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(id);
  }, []);

  const aspect =
    image.exif.width && image.exif.height ? image.exif.width / image.exif.height : 3 / 2;
  const e = image.exif;
  const specs: [string, string][] = [
    ["Camera", [e.make, e.model].filter(Boolean).join(" ")],
    ["Lens", e.lens],
    ["Focal length", e.focalLength],
    ["Aperture", e.aperture],
    ["Shutter", e.exposure],
    ["ISO", e.iso],
    ["Taken", e.captureDate],
  ];

  return (
    <Dialog.Panel className="flex max-h-full w-full max-w-5xl flex-col items-center gap-3 overflow-y-auto">
      <Dialog.Title className="sr-only">{image.path.split("/").pop()}</Dialog.Title>
      {/* dvh, not vh: on mobile Safari vh is the *large* viewport, so a 74vh
          image plus its spec row slid under the URL bar. */}
      <div
        className="relative max-h-[62dvh] w-full shrink-0 overflow-hidden rounded-sm sm:max-h-[74dvh]"
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

      <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-white/75">
        {specs
          .filter(([, v]) => v && v !== "N/A")
          .map(([k, v]) => (
            <span key={k}>
              <span className="text-white/40">{k}</span> {v}
            </span>
          ))}
        {total > 0 && (
          <span className="text-white/40">
            {index + 1} / {total}
          </span>
        )}
      </div>
    </Dialog.Panel>
  );
};
