import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	ApiError,
	ApiResponseValidationError,
	NonRetryableError,
} from "@/api/error";
import { shouldRetryQuery } from "@/api/query-retry";

describe("shouldRetryQuery", () => {
	it("does not retry response validation failures", () => {
		const validationResult = z.string().safeParse(42);

		if (validationResult.success) {
			throw new Error("Expected schema validation to fail");
		}

		const error = new ApiResponseValidationError(
			"GET",
			"/v1/items",
			validationResult.error,
		);

		expect(shouldRetryQuery(0, error)).toBe(false);
	});

	it("does not retry deterministic data mapping failures", () => {
		class DataMappingError extends NonRetryableError {}

		expect(shouldRetryQuery(0, new DataMappingError("Invalid DTO"))).toBe(
			false,
		);
	});

	it("does not retry deterministic client errors", () => {
		for (const status of [400, 401, 403, 404, 409, 422]) {
			const error = new ApiError(status, "Client Error", null, new Headers());

			expect(shouldRetryQuery(0, error)).toBe(false);
		}
	});

	it("retries timeouts, rate limits, and server errors", () => {
		for (const status of [408, 429, 500, 503]) {
			const error = new ApiError(status, "Transient", null, new Headers());

			expect(shouldRetryQuery(0, error)).toBe(true);
		}
	});

	it("preserves the default three retries for other failures", () => {
		const error = new Error("Network unavailable");

		expect(shouldRetryQuery(0, error)).toBe(true);
		expect(shouldRetryQuery(2, error)).toBe(true);
		expect(shouldRetryQuery(3, error)).toBe(false);
	});
});
