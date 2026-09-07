const ZIP_CONTENT_TYPES = new Set([
	"application/zip",
	"application/x-zip-compressed",
	"application/octet-stream",
]);

export function isZipCourseAsset(
	fileName: string,
	contentType?: string | null,
) {
	const normalizedFileName = fileName.trim().toLowerCase();
	if (!normalizedFileName.endsWith(".zip")) return false;

	if (!contentType) return true;
	return ZIP_CONTENT_TYPES.has(contentType.toLowerCase());
}
