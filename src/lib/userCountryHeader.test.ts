import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
	vi.stubEnv("NODE_ENV", "production");
	vi.stubEnv("DB_URL", "postgresql://postgres:password@localhost:5432/test");
	vi.stubEnv("BETTER_AUTH_SECRET", "test-secret");
	vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
	vi.stubEnv("AWS_ACCESS_KEY_ID", "test");
	vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test");
	vi.stubEnv("AWS_REGION", "us-east-1");
	vi.stubEnv("S3_BUCKET_NAME", "test");
	vi.stubEnv("CLOUDFRONT_DOMAIN", "https://cdn.example.com");
	vi.stubEnv("SES_FROM_EMAIL", "test@example.com");
	vi.stubEnv("DODOPAYMENTS_API_KEY", "test");
	vi.stubEnv("DODOPAYMENTS_WEBHOOK_SECRET", "test");
	vi.stubEnv("PPP_50_COUPON_ID", "test-50");
	vi.stubEnv("PPP_40_COUPON_ID", "test-40");
	vi.stubEnv("PPP_30_COUPON_ID", "test-30");
	vi.stubEnv("PPP_20_COUPON_ID", "test-20");
	vi.stubEnv("SERVER_URL", "http://localhost:3000");
	vi.stubEnv("GOOGLE_CLIENT_ID", "test");
	vi.stubEnv("GOOGLE_CLIENT_SECRET", "test");
	vi.stubEnv("VITE_SERVER_URL", "http://localhost:3000");
});

describe("resolveUserCountry", () => {
	it("resolves the app country header first", async () => {
		const { resolveUserCountry } = await import("./userCountryHeader");
		const headers = new Headers({
			"x-user-country": "us",
			"cf-ipcountry": "ca",
		});

		expect(resolveUserCountry(headers)).toBe("US");
	});

	it("falls back to platform country headers", async () => {
		const { resolveUserCountry } = await import("./userCountryHeader");
		const headers = new Headers({ "cloudfront-viewer-country": "gb" });

		expect(resolveUserCountry(headers)).toBe("GB");
	});
});
