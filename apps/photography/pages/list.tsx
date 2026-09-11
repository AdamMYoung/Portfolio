import type { GetStaticProps } from "next";
import posthog from "posthog-js";
import { useState } from "react";
import { GridImage } from "../src/components";
import { ImageModal } from "../src/components/gallery/ImageModal";
import { ImageGrid } from "../src/components/image-grid";
import { imageGallery, JsonLd, ogImageFor, Seo } from "../src/components/seo";
import { getImages, type Image } from "../src/utils";

type ListProps = {
  images: Image[];
};

const DESCRIPTION =
  "The full collection of Adam Young's photography — landscapes, travel and the outdoors — as one continuous image grid.";

export default function List({ images }: ListProps) {
  // -1 = closed. An index (not the image) so prev/next can just step it.
  const [active, setActive] = useState(-1);
  const step = (dir: 1 | -1) =>
    setActive((i) => (i < 0 ? i : (i + dir + images.length) % images.length));

  return (
    <>
      <Seo
        title="Photographs — Adam Young"
        description={DESCRIPTION}
        path="/list"
        image={images[0] ? ogImageFor(images[0].path) : undefined}
      />
      <JsonLd
        data={imageGallery({
          name: "Photographs — Adam Young",
          description: DESCRIPTION,
          path: "/list",
          images: images.map((i) => i.path),
        })}
      />

      <ImageGrid>
        {images.map((image, index) => (
          <GridImage
            key={image.path}
            image={image}
            isPriority={index <= 10}
            onOpen={() => {
              setActive(index);
              posthog.capture("artwork_viewed", { source: "grid" });
            }}
          />
        ))}
      </ImageGrid>

      <ImageModal
        image={images[active] ?? null}
        onClose={() => setActive(-1)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        index={active}
        total={images.length}
      />
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
