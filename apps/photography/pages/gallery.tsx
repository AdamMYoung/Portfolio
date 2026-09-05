import type { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";

import { buildRooms, getImages, type Room } from "../src/utils";

const GalleryCanvas = dynamic(() => import("../src/components/gallery/GalleryCanvas"), {
  ssr: false,
});

type GalleryProps = {
  rooms: Room[];
};

export default function Gallery({ rooms }: GalleryProps) {
  return (
    <>
      <Head>
        <title>Adam Young | Photography</title>
        <meta
          name="description"
          content="Photography portfolio of Photographer, Adam Young — 3D gallery"
        />
      </Head>
      <GalleryCanvas rooms={rooms} />
    </>
  );
}

export const getStaticProps: GetStaticProps<GalleryProps> = async () => {
  const images = await getImages();
  const rooms = buildRooms(images);

  return {
    props: {
      rooms,
    },
  };
};
