import { promises as fs } from "fs";
import path from "path";
import { IImageRepository, ImageData } from "./image.types";

export class LocalImageRepository implements IImageRepository {
  async getImagesByFolder(folderName: string): Promise<ImageData[]> {
    const folderPath = path.resolve(`.image-cache/${folderName}`);
    const files = await fs.readdir(folderPath);

    return Promise.all(
      files.map(async (file) => {
        const fileData = await fs.readFile(`${folderPath}/${file}`);

        return {
          data: fileData,
          path: fileData.toString("base64"),
        };
      })
    );
  }
}
