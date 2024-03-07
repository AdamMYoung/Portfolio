import { getPlaiceholder } from "plaiceholder";
import { IImageRepository, ImageData } from "./image.types";

import { S3Client, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

const bucketParams = { Bucket: process.env.S3_BUCKET_NAME };

export const getBucketObjects = async () => {
  const data = await client.send(new ListObjectsCommand(bucketParams));

  return data;
};

export class AWSImageRepository {
  async getImages(): Promise<ImageData[]> {
    const objects = await getBucketObjects();

    const parsedObjects = await Promise.all(
      (objects.Contents ?? []).map(async (obj) => {
        const data = await client.send(new GetObjectCommand({ ...bucketParams, Key: obj.Key }));

        const byteArray = await data.Body!.transformToByteArray();
        const fileData = byteArray.buffer;

        const { base64 } = await getPlaiceholder(Buffer.from(fileData));

        return {
          data: fileData,
          path: `https://${process.env.S3_BUCKET_HOSTNAME}/${obj.Key}`,
          placeholder: base64 as `data:image/${string}`,
        };
      })
    );

    return parsedObjects.filter((element) => element !== undefined) as ImageData[];
  }
}
