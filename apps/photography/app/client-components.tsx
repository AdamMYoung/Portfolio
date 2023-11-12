"use client";

import React, { useEffect, useState } from "react";
import { ElementProps, ImageGrid as InternalImageGrid } from "components";

export * from "components";

export { GridImage } from "../src/components";

export const ImageGrid = ({ ...rest }: ElementProps<typeof InternalImageGrid>) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return <InternalImageGrid {...rest} />;
};
