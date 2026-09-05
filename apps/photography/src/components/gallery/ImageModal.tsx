import { Dialog } from "@headlessui/react";
import NextImage from "next/image";

import type { Image as ImageT } from "../../utils/file";

type ImageModalProps = {
  image: ImageT | null;
  onClose: () => void;
};

export const ImageModal = ({ image, onClose }: ImageModalProps) => {
  return (
    <Dialog open={!!image} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/85" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="flex max-h-full max-w-4xl flex-col items-center gap-3">
          {image && (
            <>
              <NextImage
                src={image.path}
                alt=""
                width={image.exif.width || 1600}
                height={image.exif.height || 1200}
                className="max-h-[75vh] w-auto"
              />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-white/80">
                <span>
                  {image.exif.make} {image.exif.model}
                </span>
                <span>{image.exif.focalLength}</span>
                <span>{image.exif.aperture}</span>
                <span>{image.exif.exposure}</span>
                <span>ISO {image.exif.iso}</span>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
