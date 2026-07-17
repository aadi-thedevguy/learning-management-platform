import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

const s3Client = new S3Client({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
});

const bucketName = env.S3_BUCKET_NAME;
const cloudfrontDomain = env.CLOUDFRONT_DOMAIN;

export function getVideoKey(lessonId: string, fileName: string) {
	const extension = fileName.split(".").pop() ?? "mp4";
	return `videos/${lessonId}.${extension}`;
}

export function getVideoPublicUrl(key: string) {
	if (cloudfrontDomain) {
		return `https://${cloudfrontDomain}/${key}`;
	}
	return `https://${bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

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
	const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
	const publicUrl = getVideoPublicUrl(key);
	return { uploadUrl, publicUrl, key };
}

export async function getVideoDownloadPresignedUrl(key: string) {
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: key,
	});
	return getSignedUrl(s3Client, command, { expiresIn: 300 });
}
