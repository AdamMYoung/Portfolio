export type ImageData = {
  data: Buffer;
  placeholder: `data:image/${string}`;
  path: string;
};

export interface IImageRepository {
  getImagesByFolder(folderName: string): Promise<ImageData[]>;
}
