import { IImageRepository, ImageData } from "./image.types";

import { S3Client, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "eu-west-1",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY ?? "",
  },
});

const bucketParams = { Bucket: process.env.AWS_S3_BUCKET_NAME };

export const getBucketObjects = async () => {
  const data = await client.send(new ListObjectsCommand(bucketParams));

  return data;
};

export class AWSImageRepository implements IImageRepository {
  async getImagesByFolder(folderName: string): Promise<ImageData[]> {
    const objects = await getBucketObjects();

    const filteredObjects = objects.Contents?.filter((val) => val.Key?.split("/")[0] === folderName) ?? [];

    const parsedObjects = await Promise.all(
      filteredObjects.map(async (obj) => {
        const data = await client.send(new GetObjectCommand({ ...bucketParams, Key: obj.Key }));

        const byteArray = await data.Body!.transformToByteArray();
        const fileData = byteArray.buffer;

        return {
          data: fileData,
          path: `https://${process.env.AWS_S3_BUCKET_HOSTNAME}/${process.env.AWS_S3_BUCKET_NAME}/${obj.Key}`,
        };
      })
    );

    return parsedObjects.filter((element) => element !== undefined) as ImageData[];
  }
}
