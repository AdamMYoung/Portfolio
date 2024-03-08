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
    <NextImage
      className="mb-2 w-full"
      priority={isPriority}
      alt=""
      src={image.path}
      width={image.exif.width}
      height={image.exif.height}
      sizes="(max-width: 1024px) 50vw, 25vw"
    />
  );
};
