import type { GetStaticProps } from "next";
import { GridImage } from "../src/components";
import { ImageGrid } from "../src/components/image-grid";
import { imageGallery, JsonLd, ogImageFor, Seo } from "../src/components/seo";
import { getImages, type Image } from "../src/utils";

type ListProps = {
  images: Image[];
};

const DESCRIPTION =
  "The full collection of Adam Young's photography — landscapes, travel and the outdoors — as one continuous image grid.";

export default function List({ images }: ListProps) {
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
