// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiRequest } from "@/api/request.ts";

describe("ApiRequest response validation", () => {
	it("throws a contextual validation error", async () => {
		const request = new ApiRequest(
			"GET",
			new URL("https://api.example.com/v1/items"),
			async () => ({ data: { items: "not-an-array" } }),
		).response(
			z.object({
				data: z.object({ items: z.array(z.object({ id: z.string() })) }),
			}),
		);

		const result = Promise.resolve(request);

		await expect(result).rejects.toMatchObject({
			name: "ApiResponseValidationError",
			method: "GET",
			path: "/v1/items",
			issues: [
				expect.objectContaining({
					path: ["data", "items"],
				}),
			],
		});
	});

	it("passes an abort signal to the request", async () => {
		const abortController = new AbortController();
		let receivedRequest: Request | undefined;
		const request = new ApiRequest(
			"GET",
			new URL("https://api.example.com/v1/items"),
			async (input) => {
				receivedRequest = input;
				return { data: [] };
			},
		)
			.signal(abortController.signal)
			.response(z.object({ data: z.array(z.string()) }));

		await Promise.resolve(request);

		expect(receivedRequest?.signal.aborted).toBe(false);
		abortController.abort();
		expect(receivedRequest?.signal.aborted).toBe(true);
	});
});
