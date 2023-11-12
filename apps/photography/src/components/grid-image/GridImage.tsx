import React from "react";
import NextImage from "next/image";

import { Image } from "../../utils";

type GridImageProps = {
  index: number;
  image: Image;
  placeholder: `data:image/${string}`;
  isPriority?: boolean;
};

export const GridImage = ({ image, placeholder, isPriority }: GridImageProps) => {
  return (
    <div className="relative w-full" style={{ aspectRatio: image.exif.width / image.exif.height }}>
      <NextImage
        priority={isPriority}
        alt=""
        placeholder={placeholder}
        src={image.path}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
      />
    </div>
  );
};
