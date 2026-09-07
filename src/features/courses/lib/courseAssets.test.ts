import { describe, expect, it } from "vitest";
import { isZipCourseAsset } from "./courseAssets";

describe("isZipCourseAsset", () => {
	it("accepts .zip course assets", () => {
		expect(isZipCourseAsset("course-assets.zip", "application/zip")).toBe(true);
		expect(
			isZipCourseAsset("COURSE-ASSETS.ZIP", "application/octet-stream"),
		).toBe(true);
	});

	it("rejects non-zip course assets", () => {
		expect(isZipCourseAsset("course-assets.pdf", "application/pdf")).toBe(
			false,
		);
		expect(isZipCourseAsset("course-assets.zip.exe", "application/zip")).toBe(
			false,
		);
	});
});
