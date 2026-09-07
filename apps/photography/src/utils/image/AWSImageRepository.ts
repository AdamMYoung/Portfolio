import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { mapLimit } from "../mapLimit";
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

const bucket = requiredEnv("S3_BUCKET_NAME");
const bucketHostname = requiredEnv("S3_BUCKET_HOSTNAME");

// How many object bodies to pull from R2 at once. The AWS SDK's default HTTP
// handler caps at 50 sockets; firing every object at once (100s of them,
// ×3 during parallel static generation) blew past that and silently dropped
// responses — the gallery was only ever seeing part of the collection.
const FETCH_CONCURRENCY = 8;

// Every object key in the bucket, following pagination past the 1000-key page
// limit. One request per 1000 keys — cheap.
const listAllKeys = async (): Promise<string[]> => {
  const keys: string[] = [];
  let ContinuationToken: string | undefined;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken }));
    for (const obj of page.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return keys;
};

// Just the public URLs — one LIST walk, no per-object downloads. Used by the
// sitemap, which needs the addresses but none of the EXIF/colour work.
export const listPhotoUrls = async (): Promise<string[]> => {
  const keys = await listAllKeys();
  return keys.map((key) => `https://${bucketHostname}/${key}`);
};

export class AWSImageRepository {
  async getImages(): Promise<ImageData[]> {
    const keys = await listAllKeys();

    return mapLimit(keys, FETCH_CONCURRENCY, async (key) => {
      const data = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const byteArray = await data.Body!.transformToByteArray();
      return {
        data: byteArray.buffer as ArrayBuffer,
        path: `https://${bucketHostname}/${key}`,
      };
    });
  }
}
