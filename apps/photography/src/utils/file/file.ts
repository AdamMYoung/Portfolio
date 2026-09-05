import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ExifReader from "exifreader";
import { type Color, getDominantColor } from "../color";
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
  color: Color;
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
      const color = await getDominantColor(file.data);

      const [height, width, make, model, aperture, exposure, focalLength, lens, iso, captureDate] =
        getExifData(exifData, [
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
        ]);

      return {
        path: file.path,
        color,
        exif: {
          height: parseInt(height, 10),
          width: parseInt(width, 10),
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
