import React from "react";
import NextImage from "next/image";

import { Image } from "../../utils";

type GridImageProps = {
  index: number;
  image: Image;
  isPriority?: boolean;
};

export const GridImage = ({ image, isPriority }: GridImageProps) => {
  return (
    <div className="relative w-full" style={{ aspectRatio: image.exif.width / image.exif.height }}>
      <NextImage
        className="transition-all hover:cursor-pointer hover:brightness-75 active:brightness-50"
        priority={isPriority}
        alt=""
        src={image.path}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
      />
    </div>
  );
};
