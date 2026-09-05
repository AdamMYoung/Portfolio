import type { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";

import { buildGallery, type Gallery, getImages } from "../src/utils";

const GalleryCanvas = dynamic(() => import("../src/components/gallery/GalleryCanvas"), {
  ssr: false,
});

type GalleryProps = {
  gallery: Gallery;
};

export default function GalleryPage({ gallery }: GalleryProps) {
  return (
    <>
      <Head>
        <title>Adam Young | Photography</title>
        <meta
          name="description"
          content="Photography portfolio of Photographer, Adam Young — 3D gallery"
        />
      </Head>
      <GalleryCanvas gallery={gallery} />
    </>
  );
}

export const getStaticProps: GetStaticProps<GalleryProps> = async () => {
  const images = await getImages();
  const gallery = buildGallery(images);

  return {
    props: {
      gallery,
    },
  };
};
