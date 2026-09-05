import type { GetStaticProps } from "next";
import Head from "next/head";
import { GridImage } from "../src/components";
import { ImageGrid } from "../src/components/image-grid";
import { getImages, type Image } from "../src/utils";

type ListProps = {
  images: Image[];
};

export default function List({ images }: ListProps) {
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

export const getStaticProps: GetStaticProps<ListProps> = async () => {
  const images = await getImages();

  return {
    props: {
      images,
    },
  };
};
