import "server-only";

import ExifReader from "exifreader";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { IImageRepository, LocalImageRepository, AWSImageRepository } from "../image";

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

const getExifData = (exif: any, keys: string[]): string[] => {
  return keys.map((key) => exif?.[key]?.description ?? "N/A");
};

export const getAllFolders = async (): Promise<string[]> => {
  const directory = await getBucketObjects();

  const set = new Set<string>();

  directory.Contents?.forEach((d) => {
    const folderName = d.Key?.split("/")[0];

    if (folderName) {
      set.add(folderName);
    }
  });

  return Array.from(set);
};

export const getImagesByFolder = async (folderName: string): Promise<Image[]> => {
  let imageRepository: IImageRepository;

  if (process.env.NODE_ENV === "development") {
    imageRepository = new LocalImageRepository();
  } else {
    imageRepository = new AWSImageRepository();
  }

  const files = await imageRepository.getImagesByFolder(folderName);

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
