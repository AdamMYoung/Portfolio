"use client";

import React, { useEffect, useState } from "react";
import { ElementProps, ImageGrid as InternalImageGrid } from "portfolio-shared";
import { SelectedImageProvider } from "../src/providers";

export * from "portfolio-shared";

export { GridImage } from "../src/components";

export const ImageGrid = ({
  numberOfImages,
  ...rest
}: ElementProps<typeof InternalImageGrid> & ElementProps<typeof SelectedImageProvider>) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <SelectedImageProvider numberOfImages={numberOfImages}>
      <InternalImageGrid {...rest} />
    </SelectedImageProvider>
  );
};
