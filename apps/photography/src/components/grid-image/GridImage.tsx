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
    <NextImage
      className="mb-2 w-full"
      alt=""
      placeholder="blur"
      blurDataURL={placeholder}
      src={image.path}
      width={image.exif.width}
      height={image.exif.height}
    />
  );
};
