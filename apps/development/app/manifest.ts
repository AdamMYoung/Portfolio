import type { MetadataRoute } from "next";
import { DESCRIPTION, SITE_NAME } from "./site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Adam Young — Software Engineer",
    short_name: SITE_NAME,
    description: DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#05010f",
    theme_color: "#05010f",
    icons: [
      { src: "/icon", type: "image/png", sizes: "48x48" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
