import React from "react";

import { Image, getImages } from "../src/utils";

import { GridImage } from "../src/components";
import { GetStaticProps } from "next";
import Head from "next/head";
import { ImageGrid } from "../src/components/image-grid";

type HomeProps = {
  images: Image[];
};

export default function Home({ images }: HomeProps) {
  return (
    <>
      <Head>
        <title>Adam Young | Photography</title>
        <meta name="description" content="Photography portfolio of Photographer, Adam Young" />
      </Head>

      <ImageGrid>
        {images.map((image, index) => (
          <GridImage key={image.path} index={index} image={image} isPriority={index <= 10} />
        ))}
      </ImageGrid>
    </>
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
