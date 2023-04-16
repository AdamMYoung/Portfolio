import React from "react";

import { ImageGrid, GridImage } from "./client-components";
import { getImagesByFolder } from "../src/utils";
import { Metadata } from "next";

export default async function Home() {
  const images = await getImagesByFolder("home");

  return (
    <ImageGrid numberOfImages={images.length} className="md:mr-2">
      {images.map((image, index) => (
        <div key={image.path} className="h-fit w-full">
          <GridImage index={index} image={image} isPriority={index <= 30} />
        </div>
      ))}
    </ImageGrid>
  );
}

export const metadata: Metadata = {
  title: "Adam Young | Photography",
  description: "Photography portfolio of Photographer, Adam Young",
};

export const revalidate = 60;
