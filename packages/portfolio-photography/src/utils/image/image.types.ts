export type ImageData = {
  data: Buffer;
  path: string;
};

export interface IImageRepository {
  getImagesByFolder(folderName: string): Promise<ImageData[]>;
}
