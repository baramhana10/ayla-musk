import { GridFSBucket, MongoClient } from "mongodb";
import { ApiError } from "../utils/ApiError";

let clientPromise: Promise<MongoClient> | undefined;

export async function getUploadsBucket() {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("mongodb")) {
    throw new ApiError(503, "Image storage is not configured on the server.");
  }

  if (!clientPromise) {
    const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });
    clientPromise = client.connect().catch(async error => {
      clientPromise = undefined;
      await client.close().catch(() => {});
      throw error;
    });
  }
  const client = await clientPromise;
  return new GridFSBucket(client.db(), { bucketName: "uploads" });
}
