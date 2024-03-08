import React from "react";
import { ImageGrid } from "components";

import { Image, getImages } from "../src/utils";

import { GridImage } from "../src/components";
import { GetStaticProps } from "next";

type HomeProps = {
  images: Image[];
};

export default function Home({ images }: HomeProps) {
  return (
    <ImageGrid>
      {images.map((image, index) => (
        <GridImage key={image.path} index={index} image={image} placeholder={image.placeholder} />
      ))}
    </ImageGrid>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const images = await getImages();

  return {
    props: {
      images,
    },
  };
};
