import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

const client = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY,
    secretAccessKey: env.R2_SECRET_KEY,
  },
});

const bucketName = env.R2_BUCKET_NAME;
const publicBaseUrl = env.R2_URL.replace(/\/+$/, "");

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function getVideoKey(lessonId: string, fileName: string) {
  const extension = fileName.split(".").pop() ?? "mp4";
  return `videos/${lessonId}.${extension}`;
}

export function getAssetKey(prefix: string, fileName: string) {
  return `assets/${prefix}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

export function getR2PublicUrl(key: string) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicBaseUrl}/${encodedKey}`;
}

export const getVideoPublicUrl = getR2PublicUrl;

export async function getVideoUploadPresignedUrl(
  lessonId: string,
  fileName: string,
  contentType = "video/mp4",
) {
  const key = getVideoKey(lessonId, fileName);
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = getVideoPublicUrl(key);
  return { uploadUrl, publicUrl, key };
}

export async function getAssetUploadPresignedUrl(
  prefix: string,
  fileName: string,
  contentType = "application/octet-stream",
) {
  const key = getAssetKey(prefix, fileName);
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = getR2PublicUrl(key);
  return { uploadUrl, publicUrl, key };
}

export async function getVideoDownloadPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: 300 });
}
