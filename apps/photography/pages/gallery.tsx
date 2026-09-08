import type { GetStaticProps } from "next";
import dynamic from "next/dynamic";

import { imageGallery, JsonLd, ogImageFor, Seo } from "../src/components/seo";
import { getImages, type Image } from "../src/utils";

const GalleryCanvas = dynamic(() => import("../src/components/gallery/GalleryCanvas"), {
  ssr: false,
});

type GalleryProps = {
  images: Image[];
};

const DESCRIPTION =
  "Walk through a three-dimensional gallery of Adam Young's photography — a lived-in, explorable space you move through with your keyboard, a drag, or a tap.";

export default function GalleryPage({ images }: GalleryProps) {
  return (
    <>
      <Seo
        title="3D Art Gallery — Adam Young"
        description={DESCRIPTION}
        path="/gallery"
        image={images[0] ? ogImageFor(images[0].path) : undefined}
      />
      <JsonLd
        data={imageGallery({
          name: "3D Art Gallery — Adam Young",
          description: DESCRIPTION,
          path: "/gallery",
          images: images.map((i) => i.path),
        })}
      />
      <GalleryCanvas images={images} />
    </>
  );
}

export const getStaticProps: GetStaticProps<GalleryProps> = async () => {
  const images = await getImages();
  // The layout is rebuilt client-side (it's a pure function of the photos and
  // a seed), so the "reshuffle" button can regenerate the building on demand.
  return { props: { images } };
};
