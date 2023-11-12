import { promises as fs, existsSync } from "fs";
import { getPlaiceholder } from "plaiceholder";
import path from "path";
import sharp from "sharp";
import { IImageRepository, ImageData } from "./image.types";

export class LocalImageRepository implements IImageRepository {
  async getImagesByFolder(folderName: string): Promise<ImageData[]> {
    if (!existsSync(".image-cache")) {
      return [];
    }

    const folderPath = path.resolve(`.image-cache/${folderName}`);
    const files = await fs.readdir(folderPath);

    return Promise.all(
      files.map(async (file) => {
        const fileData = await fs.readFile(`${folderPath}/${file}`);

        const compressed = await sharp(fileData).jpeg({ quality: 40 }).toBuffer();
        const { base64 } = await getPlaiceholder(compressed);

        return {
          data: fileData,
          path: `data:image/png;base64,${compressed.toString("base64")}`,
          placeholder: base64 as `data:image/${string}`,
        };
      })
    );
  }
}
