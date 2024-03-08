import React from "react";
import { ImageGrid } from "components";

import { getImages } from "../src/utils";
import { Metadata } from "next";
import { GridImage } from "../src/components";

export default async function Home() {
  const images = await getImages();

  return (
    <ImageGrid>
      {images.map((image, index) => (
        <GridImage
          key={image.path}
          index={index}
          image={image}
          placeholder={image.placeholder}
          isPriority={index <= 30}
        />
      ))}
    </ImageGrid>
  );
}

export const metadata: Metadata = {
  title: "Adam Young | Photography",
  description: "Photography portfolio of Photographer, Adam Young",
};

export const revalidate = 60;
