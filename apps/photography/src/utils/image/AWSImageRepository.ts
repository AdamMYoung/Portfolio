import { GetObjectCommand, ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import type { ImageData } from "./image.types";

// Fail loudly and specifically when an R2/S3 env var is missing — without
// this, a missing var surfaces as an opaque AWS SDK error deep in a request
// (e.g. "No value provided for input HTTP label: Bucket") that gives no clue
// which var or where to set it (see apps/photography/.env for the full list;
// on Vercel these need adding under the project's Environment Variables).
const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable "${name}" for the R2/S3 image bucket.`);
  }
  return value;
};

const client = new S3Client({
  region: "auto",
  endpoint: `https://${requiredEnv("CLOUDFLARE_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requiredEnv("S3_ACCESS_KEY"),
    secretAccessKey: requiredEnv("S3_SECRET_ACCESS_KEY"),
  },
});

const bucketParams = { Bucket: requiredEnv("S3_BUCKET_NAME") };
const bucketHostname = requiredEnv("S3_BUCKET_HOSTNAME");

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

        return {
          data: fileData,
          path: `https://${bucketHostname}/${obj.Key}`,
        };
      })
    );

    return parsedObjects.filter((element) => element !== undefined) as ImageData[];
  }
}
