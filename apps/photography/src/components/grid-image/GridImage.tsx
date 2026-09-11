import NextImage from "next/image";

import type { Image } from "../../utils";

type GridImageProps = {
  image: Image;
  isPriority?: boolean;
  onOpen: () => void;
};

export const GridImage = ({ image, isPriority, onOpen }: GridImageProps) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="View image"
      className="mb-2 block w-full cursor-zoom-in"
    >
      <NextImage
        className="w-full"
        priority={isPriority}
        alt=""
        src={image.path}
        width={image.exif.width}
        height={image.exif.height}
        sizes="(max-width: 1024px) 50vw, 25vw"
      />
    </button>
  );
};
