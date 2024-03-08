import ExifReader from "exifreader";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AWSImageRepository } from "../image";

dayjs.extend(customParseFormat);

export type ImageExif = {
  height: number;
  width: number;
  make: string;
  model: string;
  aperture: string;
  exposure: string;
  focalLength: string;
  lens: string;
  iso: string;
  captureDate: string;
};

export type Image = {
  path: string;
  exif: ImageExif;
};

const imageRepository = new AWSImageRepository();

const getExifData = (exif: any, keys: string[]): string[] => {
  return keys.map((key) => exif?.[key]?.description ?? "N/A");
};

export const getImages = async (): Promise<Image[]> => {
  const files = await imageRepository.getImages();

  const images = await Promise.all(
    files.map(async (file) => {
      const exifData = ExifReader.load(file.data);

      const [height, width, make, model, aperture, exposure, focalLength, lens, iso, captureDate] = getExifData(
        exifData,
        [
          "Image Height",
          "Image Width",
          "Make",
          "Model",
          "FNumber",
          "ExposureTime",
          "FocalLength",
          "LensModel",
          "ISOSpeedRatings",
          "DateCreated",
        ]
      );

      return {
        path: file.path,
        exif: {
          height: parseInt(height),
          width: parseInt(width),
          make,
          model,
          aperture,
          exposure,
          focalLength,
          lens,
          iso,
          captureDate,
        },
      };
    })
  );

  return images.sort((a, b) => {
    const aDate = dayjs(a.exif.captureDate, "YYYY:MM:DD HH:mm:ss");
    const bDate = dayjs(b.exif.captureDate, "YYYY:MM:DD HH:mm:ss");

    return bDate.diff(aDate);
  });
};
