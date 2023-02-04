import { S3Client, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";

type BucketItem = {
  fileData: Uint8Array;
  filePath: string;
};

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

export const getFolderData = async (folderName: string): Promise<BucketItem[]> => {
  const objects = await getBucketObjects();

  const filteredObjects = objects.Contents?.filter((val) => val.Key?.split("/")[0] === folderName) ?? [];

  const parsedObjects = await Promise.all(
    filteredObjects.map(async (obj) => {
      const data = await client.send(new GetObjectCommand({ ...bucketParams, Key: obj.Key }));

      const fileData = await data.Body!.transformToByteArray();

      return {
        fileData,
        filePath: `${process.env.AWS_S3_BUCKET_BASE_URL}${obj.Key}`,
      };
    })
  );

  return parsedObjects;
};
