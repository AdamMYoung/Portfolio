import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { Image } from "./file";

dayjs.extend(customParseFormat);

// Its own module, not file.ts: the grid and the viewer are client components,
// and file.ts pulls in sharp, ExifReader and the S3 client.
/**
 * Alt text for a photo. The collection carries no captions, only EXIF, so this
 * says what the image is and when it was taken rather than guessing at the
 * subject. Better than the empty alt every photo had, which told search engines
 * and screen readers there was nothing there.
 */
export const altFor = ({ exif }: Pick<Image, "exif">): string => {
  const taken = dayjs(exif.captureDate, ["YYYY:MM:DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss"]);
  return taken.isValid()
    ? `Photograph by Adam Young, taken ${taken.format("D MMMM YYYY")}`
    : "Photograph by Adam Young";
};
